// transcript.js
const transcriptBox = document.getElementById("transcriptBox");
const backBtn = document.getElementById("backBtn");
const footer = document.querySelector('.footer');

// Go back to popup
backBtn.addEventListener("click", () => {
  window.location.href = "popup.html";
});

// Function to display transcript data
function displayTranscript(transcriptData) {
  if (!Array.isArray(transcriptData)) {
    transcriptData = [];
  }
  
  transcriptBox.innerHTML = '';
  
  if (transcriptData.length === 0) {
    transcriptBox.innerHTML = '<div class="no-transcript">No conversation detected yet. Speak in your meeting to see transcript here.</div>';
    footer.innerHTML = `<small>🎤 Waiting for captions...</small>`;
    return;
  }
  
  transcriptData.forEach(item => {
    if (item.text && item.timestamp) {
      const transcriptItem = document.createElement("div");
      transcriptItem.className = "transcript-item";
      transcriptItem.innerHTML = `
        <div class="transcript-meta">
          <span class="speaker">${item.speaker || "Unknown Speaker"}</span>
          <span class="timestamp">${item.timestamp}</span>
        </div>
        <div class="transcript-text">${item.text}</div>
      `;
      transcriptBox.appendChild(transcriptItem);
    }
  });
  
  transcriptBox.scrollTop = transcriptBox.scrollHeight;
  footer.innerHTML = `<small>🎤 Listening... (${transcriptData.length} messages captured)</small>`;
}

// Function to load the initial transcript from storage when the page opens.
function loadInitialTranscript() {
  chrome.storage.local.get('transcript', (result) => {
    if (chrome.runtime.lastError) {
      console.error("Error loading transcript:", chrome.runtime.lastError);
      displayTranscript([]);
      return;
    }
    
    if (result.transcript) {
      console.log("Loaded transcript:", result.transcript);
      displayTranscript(result.transcript);
    } else {
      console.log("No transcript found in storage");
      displayTranscript([]);
    }
  });
}

// Listen for changes in the extension's storage.
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.transcript) {
    console.log("Transcript updated:", changes.transcript.newValue);
    displayTranscript(changes.transcript.newValue);
  }
});

// Load the transcript when the page is first opened.
document.addEventListener('DOMContentLoaded', loadInitialTranscript);