document.getElementById("chatBtn").addEventListener("click", () => {
  window.location.href = "chat.html";
});

document.getElementById("listenBtn").addEventListener("click", () => {
  window.location.href = "transcript.html";
});

// Close button: send msg to contentScript
document.getElementById("closeBtn").addEventListener("click", () => {
  window.parent.postMessage("close-autommeet", "*");
});


// DRAG START: send single dragStart message with pointer coordinates inside iframe
const dragBar = document.getElementById("dragBar");
dragBar.addEventListener("pointerdown", (e) => {
  // only left button
  if (e.button !== 0) return;
  // send initial pointer location relative to iframe content
  window.parent.postMessage({ type: "dragStart", clientX: e.clientX, clientY: e.clientY }, "*");
  // prevent default focus/selection behavior
  e.preventDefault();
});
