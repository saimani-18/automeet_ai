// contentScript.js
(function () {
  const EXISTING_ID = "autommeet-panel";
  let observer = null;
  let queuedEntries = [];
  let flushTimer = null;
  const FLUSH_INTERVAL_MS = 800;
  const KEEP_MAX_MESSAGES = 200;

  // Utility: normalize text
  function normalizeText(s) {
    return (s || "")
      .replace(/\u2026/g, "...") // ellipsis
      .replace(/[\r\n]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Create a transcript entry
  function createTranscriptEntry(speaker, text) {
    return {
      speaker: speaker || "Speaker",
      text: text || "",
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  // ====== Find captions and assign speaker properly ======
  function findCaptions() {
    const regions = document.querySelectorAll(
      'div[role="region"][aria-label="Captions"], div[aria-live="polite"]'
    );
    const results = [];

    regions.forEach((region) => {
      let defaultSpeaker = "Speaker";

      // Try to detect short speaker name from small text elements
      const possibleSpeaker = region.querySelector("span, div");
      if (possibleSpeaker) {
        const rawSpeaker = normalizeText(possibleSpeaker.textContent);
        if (rawSpeaker && rawSpeaker.length < 40 && rawSpeaker.split(" ").length <= 6) {
          defaultSpeaker = rawSpeaker;
        }
      }

      const textEls = region.querySelectorAll("*");
      textEls.forEach((el) => {
        const rawText = normalizeText(el.textContent);
        if (!rawText || rawText.length < 2) return;

        let speakerName = defaultSpeaker;
        let text = rawText;

        // Label "You" captions correctly
        if (rawText.startsWith("You")) {
          speakerName = "You";
          text = rawText.replace(/^You\s*/, "");
        } else {
          // Optional: split merged name+text (like "SaiHello")
          const match = rawText.match(/^(\S+?)([A-Z].*)$/);
          if (match && match[2]) {
            speakerName = match[1];
            text = match[2].trim();
          }
        }

        if (text && text.length > 1) {
          results.push({
            speaker: speakerName,
            text,
            element: el,
          });
        }
      });
    });

    return results;
  }

  // ====== Handle new/updated caption nodes ======
  const lastCommitted = new WeakMap();
  const pendingTimers = new WeakMap();

  function handleCaptionNode(item) {
    const text = item.text?.trim();
    if (!text) return;

    if (pendingTimers.has(item.element)) {
      clearTimeout(pendingTimers.get(item.element));
    }

    const timer = setTimeout(() => {
      const prevCommitted = lastCommitted.get(item.element);

      if (prevCommitted !== text) {
        const entry = createTranscriptEntry(item.speaker, text);
        queuedEntries.push(entry);
        scheduleFlush();
        lastCommitted.set(item.element, text);
        console.debug("✅ Finalized caption:", entry);
      }

      pendingTimers.delete(item.element);
    }, 1000);

    pendingTimers.set(item.element, timer);
  }

  // ====== Debounced storage flush ======
  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushQueuedEntries();
    }, FLUSH_INTERVAL_MS);
  }

  function flushQueuedEntries() {
    if (!queuedEntries.length) return;
    const toSave = queuedEntries.slice();
    queuedEntries = [];

    chrome.storage.local.get("transcript", (result) => {
      let current = Array.isArray(result.transcript) ? result.transcript : [];
      current = current.concat(toSave);

      // Deduplicate messages: ignore any entry with the same text already present
      const seenTexts = new Set();
      const deduped = [];
      for (let i = 0; i < current.length; i++) {
        const cur = current[i];
        const key = cur.text.trim();
        if (!seenTexts.has(key)) {
          deduped.push(cur);
          seenTexts.add(key);
        }
      }

      // Keep last N messages
      if (deduped.length > KEEP_MAX_MESSAGES) {
        deduped.splice(0, deduped.length - KEEP_MAX_MESSAGES);
      }

      chrome.storage.local.set({ transcript: deduped }, () => {
        if (chrome.runtime.lastError) {
          console.error("AutoMeet: error saving transcript", chrome.runtime.lastError);
        } else {
          console.log("AutoMeet: transcript updated", deduped);
        }
      });
    });
  }


  // ====== Observe dynamic DOM changes ======
  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(() => {
      const items = findCaptions();
      items.forEach(handleCaptionNode);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    console.log("AutoMeet: caption observer started");
  }

  // ====== Cleanup ======
  function cleanup() {
    if (observer) observer.disconnect();
    if (flushTimer) clearTimeout(flushTimer);
    const panel = document.getElementById(EXISTING_ID);
    if (panel && panel.parentElement) panel.parentElement.removeChild(panel);
    window.removeEventListener("message", onMessage);
    console.log("AutoMeet: cleaned up");
  }

  // ====== Panel setup ======
  function setupPanel() {
    const iframe = document.createElement("iframe");
    iframe.id = EXISTING_ID;
    iframe.src = chrome.runtime.getURL("popup.html");
    Object.assign(iframe.style, {
      position: "fixed",
      width: "480px",
      height: "600px",
      border: "none",
      borderRadius: "12px",
      zIndex: "2147483647",
      boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
      background: "transparent",
      overflow: "hidden",
      left: `${Math.max(12, Math.round((window.innerWidth - 480) / 2))}px`,
      top: `${Math.max(12, Math.round((window.innerHeight - 600) / 2))}px`,
    });
    document.body.appendChild(iframe);
    window.addEventListener("message", onMessage);
  }

  function onMessage(ev) {
    if (ev.data === "close-autommeet") {
      cleanup();
    }
  }

  // ====== Start the extension ======
  function start() {
    if (document.getElementById(EXISTING_ID)) {
      console.warn("AutoMeet: already running");
      return;
    }

    setupPanel();

    chrome.storage.local.get("transcript", (r) => {
      if (!Array.isArray(r.transcript)) {
        chrome.storage.local.set({ transcript: [] }, startObserver);
      } else {
        startObserver();
      }
    });

    console.log("AutoMeet: started transcript monitoring");
  }

  setTimeout(start, 1500);
})();
