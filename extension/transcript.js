// transcript.js
const transcriptBox = document.getElementById("transcriptBox");
const backBtn = document.getElementById("backBtn");
const closeBtn = document.getElementById("closeBtn");
const footer = document.querySelector('footer');

// Go back to popup
backBtn.addEventListener("click", () => {
  window.location.href = "popup.html";
});

// Close the extension
closeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  window.parent.postMessage("close-autommeet", "*"); // Message to parent content script
});

let meetingTabId = null;
let connectionRetries = 0;
const MAX_RETRIES = 3;
let displayedCaptions = new Set();
let meetingTabCheckInterval = null;

// Variable to hold the empty state element reference
let currentEmptyStateElement = null;

// Register this transcript tab with the background script
chrome.runtime.sendMessage({ type: "register-transcript" }, (response) => {
  if (chrome.runtime.lastError) {
    console.error("Error registering transcript tab:", chrome.runtime.lastError);
    updateStatus("❌ Failed to register transcript tab with background.", true);
  } else if (!response || !response.success) {
    console.error("Failed to register transcript tab, no success response.");
    updateStatus("❌ Failed to register transcript tab with background.", true);
  } else {
    console.log("Transcript tab registered successfully.");
  }
});

// Function to format time
function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour12: false });
  } catch {
    return iso;
  }
}

// Function to create a unique ID for a caption
function createCaptionId(caption) {
  return `${caption.timestamp}-${caption.text.substring(0, 30)}`;
}

// Function to display the empty state message
function displayEmptyState(message = "No conversation captured yet.") {
  // Only add if it's not already there
  if (!currentEmptyStateElement || !transcriptBox.contains(currentEmptyStateElement)) {
    transcriptBox.innerHTML = ''; // Clear existing content first
    currentEmptyStateElement = document.createElement("div");
    currentEmptyStateElement.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #888;">
        <p>${message}</p>
        <p>Make sure:</p>
        <ul style="text-align: left; display: inline-block;">
          <li>You're in a meeting</li>
          <li>Live transcription is enabled</li>
          <li>Participants are speaking</li>
        </ul>
      </div>
    `;
    transcriptBox.appendChild(currentEmptyStateElement);
  } else {
    // Update message if it's already there
    currentEmptyStateElement.querySelector('p:first-child').textContent = message;
  }
}

// Function to remove the empty state message
function removeEmptyState() {
  if (currentEmptyStateElement && transcriptBox.contains(currentEmptyStateElement)) {
    transcriptBox.removeChild(currentEmptyStateElement);
    currentEmptyStateElement = null;
  }
}

// Function to render captions
function renderCaptions(caps) {
  if (!caps || caps.length === 0) {
    displayEmptyState(); // Show empty state if no captions
    return;
  }
  
  removeEmptyState(); // Remove empty state if captions are present
  
  let addedNew = false;
  
  caps.forEach(c => {
    const captionId = createCaptionId(c);
    
    if (!displayedCaptions.has(captionId)) {
      displayedCaptions.add(captionId);
      
      const p = document.createElement("div");
      p.className = "transcript-item";
      p.innerHTML = `
        <div class="transcript-meta">
          <span class="speaker">${c.speaker || "Unknown"}</span>
          <span class="timestamp">[${fmtTime(c.timestamp)}]</span>
        </div>
        <div class="transcript-text">${c.text}</div>
      `;
      transcriptBox.appendChild(p);
      addedNew = true;
    }
  });
  
  // Scroll to bottom if new content was added
  if (addedNew) {
    transcriptBox.scrollTop = transcriptBox.scrollHeight;
  }
  
  // Limit the size of displayedCaptions to prevent memory issues
  if (displayedCaptions.size > 1000) {
    // Convert to array, slice, and convert back to set
    const arrayFromSet = Array.from(displayedCaptions);
    displayedCaptions = new Set(arrayFromSet.slice(-500));
  }
}

// Function to update status
function updateStatus(message, isError = false) {
  if (footer && footer.querySelector('small')) {
    const statusIndicator = footer.querySelector('small');
    statusIndicator.textContent = message;
    statusIndicator.style.color = isError ? "#ff6b6b" : "#50fa7b";
  }
}

// Function to check if meeting tab is still available
function checkMeetingTab() {
  if (meetingTabId) {
    chrome.tabs.get(meetingTabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        // Meeting tab was closed or no longer exists
        console.warn(`Meeting tab ${meetingTabId} no longer exists or error:`, chrome.runtime.lastError?.message || "Tab not found.");
        updateStatus("❌ Meeting tab was closed", true);
        
        // Clear transcript box and display specific message
        transcriptBox.innerHTML = ''; // Clear all content
        currentEmptyStateElement = null; // Reset empty state reference
        displayEmptyState("⚠️ The meeting tab was closed. Please join a new meeting and click the AutoMeet button to continue capturing captions.");
        
        // Stop checking
        if (meetingTabCheckInterval) {
          clearInterval(meetingTabCheckInterval);
          meetingTabCheckInterval = null;
        }
        meetingTabId = null; // Clear the stored ID
        chrome.storage.local.remove(["meetingTabId", "meetingType"]);
      }
    });
  }
}

// Function to try starting listening
function tryStartListening(tabId, fallback = false) {
  chrome.tabs.sendMessage(tabId, { type: "start-listening" }, (resp) => {
    if (chrome.runtime.lastError) {
      console.warn("Could not reach meeting tab:", chrome.runtime.lastError.message);
      
      if (connectionRetries < MAX_RETRIES && fallback) {
        connectionRetries++;
        updateStatus(`⚠️ Retrying connection... (${connectionRetries}/${MAX_RETRIES})`, true);
        setTimeout(() => tryStartListening(tabId, fallback), 1000);
      } else {
        updateStatus("❌ Failed to connect to meeting", true);
        transcriptBox.innerHTML = ''; // Clear all content
        currentEmptyStateElement = null; // Reset empty state reference
        displayEmptyState("⚠️ Could not connect to meeting. Please refresh the meeting tab and try again.");
      }
    } else {
      console.log("Listening started:", resp);
      meetingTabId = tabId;
      connectionRetries = 0;
      updateStatus("🎤 Listening for conversation...");
      
      // Start checking if meeting tab is still available
      if (!meetingTabCheckInterval) {
        meetingTabCheckInterval = setInterval(checkMeetingTab, 5000);
      }
    }
  });
}

// Function to find meeting tab and attach
function findMeetingTabAndAttach() {
  chrome.runtime.sendMessage({ type: "find-meeting-tab" }, (resp) => {
    if (chrome.runtime.lastError) {
      console.error("Error sending find-meeting-tab message:", chrome.runtime.lastError);
      updateStatus("❌ Error communicating with background script.", true);
      return;
    }

    if (resp && resp.found) {
      tryStartListening(resp.meetingTabId, false);
    } else {
      updateStatus("❌ No meeting tab found", true);
      transcriptBox.innerHTML = ''; // Clear all content
      currentEmptyStateElement = null; // Reset empty state reference
      displayEmptyState("⚠️ No meeting tab found. Open a Google Meet or Zoom meeting in the browser and click the AutoMeet button in the meeting.");
    }
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "meeting-tab-closed") {
    updateStatus("❌ Meeting tab was closed", true);
    transcriptBox.innerHTML = ''; // Clear all content
    currentEmptyStateElement = null; // Reset empty state reference
    displayEmptyState("⚠️ The meeting tab was closed. Please join a new meeting and click the AutoMeet button to continue capturing captions.");
    
    // Stop checking
    if (meetingTabCheckInterval) {
      clearInterval(meetingTabCheckInterval);
      meetingTabCheckInterval = null;
    }
    meetingTabId = null; // Clear the stored ID
    chrome.storage.local.remove(["meetingTabId", "meetingType"]);
  }
  
  if (msg.type === "update-captions") {
    renderCaptions(msg.captions || []);
  }
});

// Initialize
chrome.storage.local.get(["meetingTabId", "captions"], (res) => {
  if (chrome.runtime.lastError) {
    console.error("Error getting initial storage data:", chrome.runtime.lastError);
    updateStatus("❌ Error loading saved data.", true);
    return;
  }

  meetingTabId = res.meetingTabId;
  
  if (meetingTabId) {
    // Verify the tab still exists and is a meeting tab
    chrome.tabs.get(meetingTabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        // Tab doesn't exist anymore or error getting tab info
        console.warn(`Stored meeting tab ID ${meetingTabId} is invalid or tab not found.`, chrome.runtime.lastError?.message || "Tab not found.");
        findMeetingTabAndAttach(); // Try to find a new one
      } else {
        // Check if it's a meeting tab
        const isMeetingTab = tab.url && (
          tab.url.includes('zoom.us') || 
          tab.url.includes('zoom.com') || 
          tab.url.includes('zoomgov.com') ||
          tab.url.includes('meet.google.com')
        );
        
        if (isMeetingTab) {
          tryStartListening(meetingTabId, true);
        } else {
          console.warn(`Stored meeting tab ID ${meetingTabId} is no longer a meeting tab.`);
          findMeetingTabAndAttach(); // It's not a meeting tab anymore, find a new one
        }
      }
    });
  } else {
    findMeetingTabAndAttach();
  }
  
  // Render existing captions
  renderCaptions(res.captions || []);
});

// Listen for new captions
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.captions) {
    renderCaptions(changes.captions.newValue || []);
  }
});

// Clean up when leaving the page
window.addEventListener("beforeunload", () => {
  if (meetingTabId) {
    chrome.tabs.sendMessage(meetingTabId, { type: "stop-listening" }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn(`Could not send 'stop-listening' to meeting tab ${meetingTabId}:`, chrome.runtime.lastError.message);
      }
    });
  }
  
  if (meetingTabCheckInterval) {
    clearInterval(meetingTabCheckInterval);
  }
  // Unregister this transcript tab from the background script
  // This is implicitly handled by chrome.tabs.onRemoved in background.js
<<<<<<< Updated upstream
=======
});

const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", () => {
  chrome.storage.local.get(["captions", "meetingType"], (result) => {
    if (result.captions && result.captions.length > 0) {
      const transcriptData = {
        platform: result.meetingType || 'unknown',
        raw_data: JSON.stringify(result.captions),
        transcript_format: 'json',
        source_platform: result.meetingType || 'unknown',
        metadata: {
          title: `${result.meetingType || 'Unknown'} Meeting - Manual Save`,
          started_at: result.captions[0].timestamp,
          ended_at: new Date().toISOString(),
          participant_count: new Set(result.captions.map(c => c.speaker)).size,
          manually_saved: true
        }
      };
      
      // Also include meeting ID if we have one stored
      chrome.storage.local.get(['meetingId'], (meetingResult) => {
        if (meetingResult.meetingId) {
          transcriptData.meeting_id = meetingResult.meetingId;
        }
        
        // Send to backend
        fetch('http://localhost:5000/api/extension/transcript', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transcriptData)
        })
        .then(response => response.json())
        .then(data => {
          console.log('Transcript saved successfully:', data);
          updateStatus("✅ Transcript saved to database");
          
          // Store the meeting ID for future reference
          if (data.meeting_id) {
            chrome.storage.local.set({ meetingId: data.meeting_id });
          }
        })
        .catch(error => {
          console.error('Error saving transcript:', error);
          updateStatus("❌ Failed to save transcript", true);
        });
      });
    } else {
      updateStatus("❌ No transcript data to save", true);
    }
  });
>>>>>>> Stashed changes
});