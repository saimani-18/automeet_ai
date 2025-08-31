document.getElementById("chatBtn").addEventListener("click", () => {
  window.location.href = "chat.html";
});

document.getElementById("listenBtn").addEventListener("click", () => {
  window.location.href = "transcript.html";
});

const closeBtn = document.getElementById("closeBtn");

closeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  
  // Send message to parent (content script) to close the entire extension
  window.parent.postMessage("close-autommeet", "*");
});

// DRAG START: send single dragStart message with pointer coordinates inside iframe
const dragBar = document.getElementById("dragBar");
dragBar.addEventListener("pointerdown", (e) => {
  // only left button
  if (e.button !== 0) return;
  // send initial pointer location relative to iframe content
  window.parent.postMessage(
    { type: "dragStart", clientX: e.clientX, clientY: e.clientY },
    "*"
  );
  // prevent default focus/selection behavior
  e.preventDefault();
});