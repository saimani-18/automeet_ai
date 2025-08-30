// contentScript.js
(function () {
  const EXISTING_ID = "autommeet-panel";

  // If already injected -> remove (toggle behavior)
  const existing = document.getElementById(EXISTING_ID);
  if (existing) {
    existing.remove();
    return;
  }

  // create iframe
  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("popup.html");
  iframe.id = EXISTING_ID;
  iframe.style.position = "fixed";
  iframe.style.width = "480px";
  iframe.style.height = "600px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "16px";
  iframe.style.zIndex = "2147483647";
  iframe.style.boxShadow = "0 10px 50px rgba(0,0,0,0.6)";
  iframe.style.background = "transparent";

  // initial centered position
  const setInitialPosition = () => {
    const w = parseInt(iframe.style.width, 10);
    const h = parseInt(iframe.style.height, 10);
    const left = Math.max(12, Math.round((window.innerWidth - w) / 2));
    const top = Math.max(12, Math.round((window.innerHeight - h) / 2));
    iframe.style.left = left + "px";
    iframe.style.top = top + "px";
  };
  setInitialPosition();

  document.body.appendChild(iframe);

  // Handle close message from iframe
  const onMessage = (ev) => {
    try {
      const data = ev.data;
      if (data === "close-autommeet") {
        cleanup();
      } else if (data && data.type === "dragStart") {
        startDrag(data.clientX, data.clientY);
      }
    } catch (err) {
      // ignore
      console.warn("contentScript message parse error", err);
    }
  };
  window.addEventListener("message", onMessage);

  // CLEANUP
  function cleanup() {
    window.removeEventListener("message", onMessage);
    removeOverlay();
    if (iframe && iframe.parentElement) iframe.parentElement.removeChild(iframe);
  }

  // Drag logic implemented in parent using overlay (smooth)
  let overlay = null;
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let latestX = 0;
  let latestY = 0;
  let rafId = null;

  function removeOverlay() {
    if (overlay && overlay.parentElement) {
      overlay.parentElement.removeChild(overlay);
      overlay = null;
    }
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    dragging = false;
  }

  function startDrag(iframeClientX, iframeClientY) {
    // iframeClientX/Y are coordinates relative to the iframe content viewport where user mousedown occurred.
    // Compute offset inside iframe (the point within iframe that user grabbed).
    offsetX = iframeClientX;
    offsetY = iframeClientY;

    // Create overlay that captures pointer movement across the whole page
    if (overlay) removeOverlay();
    overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: "100vw",
      height: "100vh",
      zIndex: String(2147483647 + 1),
      cursor: "grabbing",
      // transparent but capture events
      background: "transparent",
    });
    document.documentElement.appendChild(overlay);

    dragging = true;

    // On pointermove we update latest coords and schedule RAF update
    const onPointerMove = (e) => {
      latestX = e.clientX;
      latestY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          // position the iframe so that the pointer stays where the user grabbed it
          const newLeft = latestX - offsetX;
          const newTop = latestY - offsetY;

          // clamp so the panel doesn't go completely off-screen
          const maxLeft = Math.max(12, window.innerWidth - iframe.offsetWidth - 12);
          const maxTop = Math.max(12, window.innerHeight - iframe.offsetHeight - 12);
          const clampedLeft = Math.min(Math.max(12, newLeft), maxLeft);
          const clampedTop = Math.min(Math.max(12, newTop), maxTop);

          iframe.style.left = clampedLeft + "px";
          iframe.style.top = clampedTop + "px";
        });
      }
    };

    const onPointerUp = () => {
      removeOverlay();
      window.removeEventListener("pointermove", onPointerMove, { passive: true });
      window.removeEventListener("pointerup", onPointerUp, { passive: true });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });

    // Also prevent text selection while dragging (helpful)
    document.body.style.userSelect = "none";
    setTimeout(() => { document.body.style.userSelect = ""; }, 0);
  }
})();
