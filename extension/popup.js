document.getElementById("chatBtn").addEventListener("click", () => {
  window.location.href = "chat.html";
});

document.getElementById("listenBtn").addEventListener("click", () => {
  window.location.href = "transcript.html";
});

document.getElementById("closeBtn").addEventListener("click", () => {
  parent.document.getElementById("autommeet-panel").remove();
});
