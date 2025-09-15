(function () {
  if (document.body.dataset.automeetInjected) return;
  document.body.dataset.automeetInjected = "1";

  // Check if we're in Google Meet or Zoom
  const isGoogleMeet = window.location.hostname.includes('meet.google.com');
  const isZoom = window.location.hostname.includes('zoom.us') || 
                 window.location.hostname.includes('zoom.com') || 
                 window.location.hostname.includes('zoomgov.com');

  // Create the AutoMeet button
  const btn = document.createElement("button");
  btn.id = "automeet-button";
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="20" height="20" viewBox="0 0 24 24">
      <path d="M13 2L3 14h7v8l11-13h-8z"/>
    </svg>
    <span style="margin-left:6px;">AutoMeet</span>
  `;
  Object.assign(btn.style, {
    position: "fixed",
    right: "18px",
    bottom: "22px",
    zIndex: 2147483647,
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(90deg,#7c3aed,#ff2d95)",
    color: "#fff",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    boxShadow: "0 6px 24px rgba(124,58,237,0.18)",
    cursor: "pointer",
  });

  let transcriptPanel = null;
  let dragHandle = null;

  // Dragging state variables
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  // Function to handle pointermove during drag
  const onPointerMove = (e) => {
    if (!isDragging) return;

    let newLeft = e.clientX - dragOffsetX;
    let newTop = e.clientY - dragOffsetY;

    // Constrain to window boundaries
    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - transcriptPanel.offsetWidth));
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - transcriptPanel.offsetHeight));

    transcriptPanel.style.left = `${newLeft}px`;
    transcriptPanel.style.top = `${newTop}px`;
  };

  // Function to handle pointerup (end drag)
  const onPointerUp = () => {
    if (isDragging) {
      isDragging = false;
      dragHandle.style.cursor = "grab";
      transcriptPanel.style.transition = ""; // Re-enable transition after drag
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    }
  };

  function openOrToggleTranscriptPanel() {
    if (transcriptPanel) {
      const isHidden = transcriptPanel.style.display === "none";
      transcriptPanel.style.display = isHidden ? "block" : "none";
      return;
    }

    transcriptPanel = document.createElement("div");
    transcriptPanel.id = "automeet-transcript-panel";
    Object.assign(transcriptPanel.style, {
      position: "fixed",
      // Default to right side, 16px from right and top
      left: `${window.innerWidth - 380 - 16}px`, 
      top: "16px",
      right: "auto", // Ensure these are 'auto' for dynamic positioning
      bottom: "auto", // Ensure these are 'auto' for dynamic positioning
      width: "380px",
      height: "70vh",
      maxHeight: "90vh",
      zIndex: 2147483647,
      borderRadius: "10px",
      overflow: "hidden", // Keep overflow hidden for the main panel
      background: "#111",
      boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
      border: "1px solid rgba(255,255,255,0.12)",
      display: "block", // Use block display for the main container
    });

    // Iframe for transcript
    const iframe = document.createElement("iframe");
    iframe.src = chrome.runtime.getURL("transcript.html");
    Object.assign(iframe.style, {
      width: "100%",
      height: "calc(100% - 10px)", // Adjust height to account for 10px drag handle at the bottom
      border: "none",
      background: "#fff",
      display: "block", // Ensure iframe is a block element
    });

    // Dedicated drag handle - this will be part of the content script's DOM
    dragHandle = document.createElement("div");
    dragHandle.id = "automeet-drag-handle";
    Object.assign(dragHandle.style, {
      position: "absolute", // Position absolutely within the transcriptPanel
      bottom: "0",
      left: "0",
      width: "100%",
      height: "10px", // Small area for dragging
      cursor: "grab",
      zIndex: "2147483648", // Above other elements in the panel
      background: "rgba(122, 4, 235, 0.2)", 
      borderBottomLeftRadius: "10px", // Rounded corners at the bottom
      borderBottomRightRadius: "10px",
    });
    
    transcriptPanel.appendChild(iframe);
    transcriptPanel.appendChild(dragHandle); // Append drag handle after iframe
    document.body.appendChild(transcriptPanel);

    // --- Drag functionality for the transcriptPanel ---
    dragHandle.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return; // Only left mouse button
      isDragging = true;
      dragOffsetX = e.clientX - transcriptPanel.getBoundingClientRect().left;
      dragOffsetY = e.clientY - transcriptPanel.getBoundingClientRect().top;
      dragHandle.style.cursor = "grabbing";
      transcriptPanel.style.transition = "none"; // Disable transition during drag for smoother movement
      
      // Add global listeners for move and up events
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      
      e.preventDefault(); // Prevent text selection etc.
    });
    // --- End Drag functionality ---
  }

  btn.onclick = () => {
    chrome.runtime.sendMessage({ 
      type: "save-meeting-tab",
      meetingType: isGoogleMeet ? "google-meet" : "zoom"
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error saving meeting tab:", chrome.runtime.lastError);
        return;
      }
      
      openOrToggleTranscriptPanel();
    });
  };

  document.body.appendChild(btn);

  // Ensure button persists
  const ensureButtonPersists = () => {
    if (!document.getElementById("automeet-button")) {
      document.body.appendChild(btn);
    }
  };

  setInterval(ensureButtonPersists, 1000);

  // Google Meet specific caption capture
  const EXISTING_ID = "autommeet-panel";
  let observer = null;
  let queuedEntries = [];
  let flushTimer = null;
  const FLUSH_INTERVAL_MS = 800;
  const KEEP_MAX_MESSAGES = 200;

  function normalizeText(s) {
    return (s || "")
      .replace(/\u2026/g, "...")
      .replace(/[\r\n]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function createTranscriptEntry(speaker, text) {
    return {
      speaker: speaker || "Speaker",
      text: text || "",
      timestamp: new Date().toISOString(),
    };
  }

  function findGoogleMeetCaptions() {
    const regions = document.querySelectorAll(
      'div[role="region"][aria-label="Captions"], div[aria-live="polite"]'
    );
    const results = [];

    regions.forEach((region) => {
      let defaultSpeaker = "Speaker";
      const possibleSpeaker = region.querySelector("span, div");
      if (possibleSpeaker) {
        const rawSpeaker = normalizeText(possibleSpeaker.textContent);
        if (rawSpeaker && rawSpeaker.length < 100) defaultSpeaker = rawSpeaker;
      }

      const textEls = region.querySelectorAll("*");
      textEls.forEach((el) => {
        const rawText = normalizeText(el.textContent);
        if (!rawText || rawText.length < 2) return;

        let speakerName = defaultSpeaker;
        let text = rawText;

        if (rawText.startsWith("You")) {
          speakerName = "You";
          text = rawText.replace(/^You\s*/, "");
        } else {
          const match = rawText.match(/^(\S+?)([A-Z].*)$/);
          if (match && match[2]) {
            speakerName = match[1].trim();
            text = match[2].trim();
          }
        }

        if (text && text.length > 1) {
          results.push({ speaker: speakerName, text, element: el });
        }
      });
    });

    return results;
  }

  const lastCommitted = new WeakMap();
  const pendingTimers = new WeakMap();

  function handleCaptionNode(item) {
    const text = item.text?.trim();
    if (!text) return;

    if (pendingTimers.has(item.element)) clearTimeout(pendingTimers.get(item.element));

    const timer = setTimeout(() => {
      const prevCommitted = lastCommitted.get(item.element);
      if (prevCommitted !== text) {
        const entry = createTranscriptEntry(item.speaker, text);
        queuedEntries.push(entry);
        scheduleFlush();
        lastCommitted.set(item.element, text);
      }
      pendingTimers.delete(item.element);
    }, 1000);

    pendingTimers.set(item.element, timer);
  }

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

    chrome.storage.local.get("captions", (result) => {
      let current = Array.isArray(result.captions) ? result.captions : [];
      current = current.concat(toSave);

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

      if (deduped.length > KEEP_MAX_MESSAGES) {
        deduped.splice(0, deduped.length - KEEP_MAX_MESSAGES);
      }

      chrome.storage.local.set({ captions: deduped });
    });
  }

  function startGoogleMeetObserver() {
    if (observer) return;
    observer = new MutationObserver(() => {
      const items = findGoogleMeetCaptions();
      items.forEach(handleCaptionNode);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  // Zoom specific caption capture
  let isCapturing = false;
  let lastCapturedText = "";
  let captionCheckInterval = null;
  let systemNotificationCount = 0;
  const MAX_SYSTEM_NOTIFICATIONS = 2;
  let captionHistory = [];
  const MAX_HISTORY = 10;

  function isSystemNotification(text) {
    if (!text) return false;
    
    const systemPatterns = [
      /video.*(started|stopped)/i,
      /audio.*(started|stopped|muted|unmuted)/i,
      /live transcription.*(on|off)/i,
      /alert/i,
      /notification/i,
      /has joined/i,
      /has left/i,
      /raised hand/i,
      /recording.*(start|stop)/i,
      /meeting.*(start|end)/i,
      /waiting room/i,
      /host.*changed/i,
      /you have.*(started|stopped)/i,
      /click.*(start|stop)/i,
      /live transcript.*(enabled|disabled)/i,
      /caption.*(on|off)/i
    ];
    
    for (const pattern of systemPatterns) {
      if (pattern.test(text)) {
        return true;
      }
    }
    
    return false;
  }

  function isConversationText(text) {
    if (!text) return false;
    
    if (isSystemNotification(text)) {
      systemNotificationCount++;
      return systemNotificationCount <= MAX_SYSTEM_NOTIFICATIONS;
    }
    
    const words = text.trim().split(/\s+/);
    if (words.length < 2) return false;
    if (text === text.toUpperCase() && words.length < 5) return false;
    
    return true;
  }

  function isDuplicateText(text) {
    if (!text) return true;
    
    for (const historyText of captionHistory) {
      if (text === historyText || 
          (text.length > 10 && historyText.includes(text)) ||
          (historyText.length > 10 && text.includes(historyText))) {
        return true;
      }
    }
    
    captionHistory.push(text);
    if (captionHistory.length > MAX_HISTORY) {
      captionHistory.shift();
    }
    
    return false;
  }

  function pushCaption(text, speaker, meetingType) {
    if (isConversationText(text) && !isDuplicateText(text)) {
      chrome.storage.local.get({ captions: [] }, (res) => {
        let current = Array.isArray(res.captions) ? res.captions : [];
        current.push({
          text: text,
          timestamp: new Date().toISOString(),
          speaker: speaker || "Unknown",
          meetingType: meetingType
        });
        if (current.length > 2000) current.splice(0, current.length - 2000);
        chrome.storage.local.set({ captions: current });
      });
    }
  }

  function findZoomCaptionElements() {
    const selectors = [
      '[class*="caption"]',
      '[class*="transcript"]',
      '[class*="cc_"]',
      '[aria-live="polite"]',
      '[aria-live="assertive"]',
      '.video-container', 
      '.main-container',
      '.meeting-app',
      '#wc-container-left',
      '#wc-container-right',
      '.video-window',
      'div[style*="bottom"]',
      'div[style*="position: absolute"]',
      'div[style*="fixed"]'
    ];
    
    let potentialElements = [];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const text = el.innerText || '';
        if (text.length > 5 && text.length < 500) {
          potentialElements.push(el);
        }
      }
    }
    
    return potentialElements;
  }

  function extractSpeaker(text) {
    const speakerMatch = text.match(/^([^:]+):/);
    if (speakerMatch && speakerMatch[1]) {
      return speakerMatch[1].trim();
    }
    
    return "Unknown";
  }

  function startZoomCapturing() {
    if (isCapturing) return;
    isCapturing = true;
    systemNotificationCount = 0;
    captionHistory = [];
    
    console.log("AutoMeet: started Zoom caption capturing");
    
    captionCheckInterval = setInterval(() => {
      const captionElements = findZoomCaptionElements();
      
      for (const el of captionElements) {
        const text = el.innerText || '';
        if (text && text !== lastCapturedText) {
          lastCapturedText = text;
          const speaker = extractSpeaker(text);
          pushCaption(text, speaker, "zoom");
        }
      }
    }, 1500);
  }

  function stopCapturing() {
    if (captionCheckInterval) {
      clearInterval(captionCheckInterval);
      captionCheckInterval = null;
    }
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    lastCapturedText = "";
    isCapturing = false;
    console.log("AutoMeet: stopped caption capturing");
  }

  // Message listener for both platforms
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "start-listening") {
      if (isGoogleMeet) {
        startGoogleMeetObserver();
      } else if (isZoom) {
        startZoomCapturing();
      }
      sendResponse({ status: "started" });
    }
    if (msg.type === "stop-listening") {
      stopCapturing();
      sendResponse({ status: "stopped" });
    }
    if (msg.type === "clear-captions") {
      chrome.storage.local.set({ captions: [] });
      sendResponse({ status: "cleared" });
    }
    if (msg.type === "check-status") {
      sendResponse({ isCapturing, lastCaptured: lastCapturedText });
    }
    if (msg.type === "ping") {
      sendResponse({ status: "alive" });
    }
    return true;
  });

  // Listen for messages from the iframe (transcript.js, chat.js, popup.js)
  window.addEventListener("message", (event) => {
    // Ensure the message is from our iframe and not another source
    if (!transcriptPanel || event.source !== transcriptPanel.querySelector('iframe').contentWindow) {
      return; 
    }

    if (event.data === "close-autommeet") {
      if (transcriptPanel) {
        transcriptPanel.remove();
        transcriptPanel = null;
        stopCapturing(); // Stop capturing when the panel is closed
      }
    } else if (event.data === "minimize-autommeet") {
      if (transcriptPanel) {
        transcriptPanel.style.display = "none";
      }
    }
  });

  // Auto-start if this is a meeting page
  if (isGoogleMeet || isZoom) {
    chrome.runtime.sendMessage({ 
      type: "save-meeting-tab",
      meetingType: isGoogleMeet ? "google-meet" : "zoom"
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending save-meeting-tab message from content script:", chrome.runtime.lastError);
      }
    });
  }
})();