// popup.js
document.getElementById("chatBtn").addEventListener("click", () => {
  window.location.href = "chat.html";
});

document.getElementById("listenBtn").addEventListener("click", () => {
  // First try to find and save the meeting tab
  chrome.runtime.sendMessage({ type: "find-meeting-tab" }, (response) => {
    if (response && response.found) {
      // Save the tab ID and open transcript
      chrome.runtime.sendMessage({ 
        type: "save-meeting-tab",
        meetingType: response.meetingType
      }, () => {
        window.location.href = "transcript.html";
      });
    } else {
      // No meeting tab found, provide instructions
      alert("No meeting detected. Please open a Google Meet or Zoom meeting in your browser first, then click the AutoMeet button in the meeting to start capturing captions.");
    }
  });
});

const closeBtn = document.getElementById("closeBtn");
// const dragBar = document.getElementById("dragBar"); // Removed: Dragging is handled by parent content script

closeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  
  // Send message to parent (content script) to close the entire extension
  window.parent.postMessage("close-autommeet", "*"); // Message to parent content script
});
