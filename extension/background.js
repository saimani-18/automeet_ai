chrome.runtime.onInstalled.addListener(() => {
  console.log("AutoMeet Extension Installed/Updated");
  chrome.storage.local.set({ captions: [] });
<<<<<<< Updated upstream
=======
});

let meetingTabs = new Map(); // Stores {tabId: {id, meetingType}}
let transcriptTabs = new Map(); // Stores {tabId: true} for active transcript iframes

// Function to notify content script to save transcript
function saveTranscriptToDatabase() {
  chrome.storage.local.get(["meetingTabId"], (result) => {
    if (result.meetingTabId) {
      chrome.tabs.sendMessage(result.meetingTabId, {
        type: "save-transcript"
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("Could not send save-transcript message:", chrome.runtime.lastError.message);
        } else {
          console.log("Transcript save initiated");
        }
      });
    }
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Handle saving meeting tab info
  if (msg.type === "save-meeting-tab" && sender.tab) {
    meetingTabs.set(sender.tab.id, {
      id: sender.tab.id,
      meetingType: msg.meetingType || "unknown"
    });
    chrome.storage.local.set({ 
      meetingTabId: sender.tab.id,
      meetingType: msg.meetingType || "unknown"
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving meetingTabId to local storage:", chrome.runtime.lastError);
      } else {
        console.log("Saved meetingTabId:", sender.tab.id, "meetingType:", msg.meetingType);
      }
    });
    sendResponse({ status: "saved" });
  }
  
  // Handle finding a meeting tab (used by popup.js)
  if (msg.type === "find-meeting-tab") {
    // First try Google Meet
    chrome.tabs.query({ url: "*://meet.google.com/*" }, (meetTabs) => {
      if (chrome.runtime.lastError) {
        console.error("Error querying Google Meet tabs:", chrome.runtime.lastError);
        sendResponse({ found: false });
        return;
      }
      if (meetTabs.length > 0) {
        const tabId = meetTabs[0].id;
        meetingTabs.set(tabId, { id: tabId, meetingType: "google-meet" });
        chrome.storage.local.set({ 
          meetingTabId: tabId,
          meetingType: "google-meet"
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving auto-detected Google Meet tab to local storage:", chrome.runtime.lastError);
            sendResponse({ found: false });
          } else {
            console.log("Auto-detected Google Meet tab:", tabId);
            sendResponse({ found: true, meetingTabId: tabId, meetingType: "google-meet" });
          }
        });
      } else {
        // Then try Zoom
        chrome.tabs.query({ url: "*://*.zoom.us/*" }, (tabsUs) => {
          if (chrome.runtime.lastError) {
            console.error("Error querying Zoom .us tabs:", chrome.runtime.lastError);
            sendResponse({ found: false });
            return;
          }
          chrome.tabs.query({ url: "*://*.zoom.com/*" }, (tabsCom) => {
            if (chrome.runtime.lastError) {
              console.error("Error querying Zoom .com tabs:", chrome.runtime.lastError);
              sendResponse({ found: false });
              return;
            }
            chrome.tabs.query({ url: "*://*.zoomgov.com/*" }, (tabsGov) => {
              if (chrome.runtime.lastError) {
                console.error("Error querying Zoom .gov tabs:", chrome.runtime.lastError);
                sendResponse({ found: false });
                return;
              }
              const allTabs = [...tabsUs, ...tabsCom, ...tabsGov];
              if (allTabs.length > 0) {
                const tabId = allTabs[0].id;
                meetingTabs.set(tabId, { id: tabId, meetingType: "zoom" });
                chrome.storage.local.set({ 
                  meetingTabId: tabId,
                  meetingType: "zoom"
                }, () => {
                  if (chrome.runtime.lastError) {
                    console.error("Error saving auto-detected Zoom tab to local storage:", chrome.runtime.lastError);
                    sendResponse({ found: false });
                  } else {
                    console.log("Auto-detected Zoom tab:", tabId);
                    sendResponse({ found: true, meetingTabId: tabId, meetingType: "zoom" });
                  }
                });
              } else {
                sendResponse({ found: false });
              }
            });
          });
        });
      }
    });
    return true; // Indicates that sendResponse will be called asynchronously
  }
  
  // Register a transcript iframe tab
  if (msg.type === "register-transcript") {
    if (sender.tab && sender.tab.id) {
      transcriptTabs.set(sender.tab.id, true);
      // Also save the transcript tab ID to local storage for persistence
      chrome.storage.local.set({ transcriptTabId: sender.tab.id }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving transcriptTabId to local storage:", chrome.runtime.lastError);
        } else {
          console.log("Registered transcript tab:", sender.tab.id);
        }
      });
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: "Sender tab ID not available." });
    }
    return true;
  }
  
  // Handle saving transcript
  if (msg.type === "save-transcript") {
    saveTranscriptToDatabase();
    sendResponse({ status: "saving" });
  }

  // Clear captions
  if (msg.type === "clear-captions") {
    chrome.storage.local.set({ captions: [] }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error clearing captions:", chrome.runtime.lastError);
      } else {
        console.log("Captions cleared.");
      }
    });
    sendResponse({ status: "cleared" });
  }
  
  // Ping for liveness check
  if (msg.type === "ping") {
    sendResponse({ status: "alive" });
  }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  if (meetingTabs.has(tabId)) {
    meetingTabs.delete(tabId);
    chrome.storage.local.remove(["meetingTabId", "meetingType"], () => {
      if (chrome.runtime.lastError) {
        console.error("Error removing meetingTabId from local storage:", chrome.runtime.lastError);
      }
    });
    console.log("Meeting tab removed:", tabId);
    
    // Notify all active transcript tabs that the meeting tab was closed
    transcriptTabs.forEach((value, transcriptTabId) => {
      chrome.tabs.sendMessage(transcriptTabId, { 
        type: "meeting-tab-closed" 
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn(`Could not send 'meeting-tab-closed' to transcript tab ${transcriptTabId}:`, chrome.runtime.lastError.message);
          // If the transcript tab is also gone, remove it from our map
          transcriptTabs.delete(transcriptTabId);
          chrome.storage.local.remove("transcriptTabId"); // Also remove from storage
        }
      });
    });
  }
  
  if (transcriptTabs.has(tabId)) {
    transcriptTabs.delete(tabId);
    chrome.storage.local.remove("transcriptTabId", () => {
      if (chrome.runtime.lastError) {
        console.error("Error removing transcriptTabId from local storage:", chrome.runtime.lastError);
      }
    });
    console.log("Transcript tab removed:", tabId);
  }
});

// Listen for tab updates to detect when a meeting might have ended or started
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const isMeeting = tab.url.includes("meet.google.com") || 
                      tab.url.includes("zoom.us") || 
                      tab.url.includes("zoom.com") || 
                      tab.url.includes("zoomgov.com");
    
    if (isMeeting) {
      const meetingType = tab.url.includes("meet.google.com") ? "google-meet" : "zoom";
      // Only update if it's a new meeting tab or type has changed
      if (!meetingTabs.has(tabId) || meetingTabs.get(tabId).meetingType !== meetingType) {
        meetingTabs.set(tabId, { id: tabId, meetingType: meetingType });
        chrome.storage.local.set({ 
          meetingTabId: tabId,
          meetingType: meetingType
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error updating meetingTabId on tab update:", chrome.runtime.lastError);
          } else {
            console.log("Updated/Detected meeting tab:", tabId, "Type:", meetingType);
          }
        });
      }
    } else if (meetingTabs.has(tabId)) {
      // If a tab that was a meeting tab navigates away, remove it
      meetingTabs.delete(tabId);
      chrome.storage.local.remove(["meetingTabId", "meetingType"], () => {
        if (chrome.runtime.lastError) {
          console.error("Error removing meetingTabId on non-meeting tab update:", chrome.runtime.lastError);
        }
      });
      console.log("Meeting tab navigated away:", tabId);

      // Notify transcript tabs that the meeting tab was closed
      transcriptTabs.forEach((value, transcriptTabId) => {
        chrome.tabs.sendMessage(transcriptTabId, { 
          type: "meeting-tab-closed" 
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn(`Could not send 'meeting-tab-closed' to transcript tab ${transcriptTabId}:`, chrome.runtime.lastError.message);
            transcriptTabs.delete(transcriptTabId);
            chrome.storage.local.remove("transcriptTabId");
          }
        });
      });
    }
  }
});

// Function to send captions to transcript tab
function sendCaptionsToTranscript(captions) {
  chrome.storage.local.get(["transcriptTabId"], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Error getting transcriptTabId from local storage:", chrome.runtime.lastError);
      return;
    }
    if (result.transcriptTabId) {
      chrome.tabs.sendMessage(result.transcriptTabId, {
        type: "update-captions",
        captions: captions
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("Could not send captions to transcript tab:", chrome.runtime.lastError.message);
          // If the transcript tab is gone, remove it from our map and storage
          transcriptTabs.delete(result.transcriptTabId);
          chrome.storage.local.remove("transcriptTabId");
        }
      });
    }
  });
}

// Listen for storage changes to update transcript tab
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.captions) {
    sendCaptionsToTranscript(changes.captions.newValue);
  }
>>>>>>> Stashed changes
});

let meetingTabs = new Map(); // Stores {tabId: {id, meetingType}}
let transcriptTabs = new Map(); // Stores {tabId: true} for active transcript iframes

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Handle saving meeting tab info
  if (msg.type === "save-meeting-tab" && sender.tab) {
    meetingTabs.set(sender.tab.id, {
      id: sender.tab.id,
      meetingType: msg.meetingType || "unknown"
    });
    chrome.storage.local.set({ 
      meetingTabId: sender.tab.id,
      meetingType: msg.meetingType || "unknown"
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving meetingTabId to local storage:", chrome.runtime.lastError);
      } else {
        console.log("Saved meetingTabId:", sender.tab.id, "meetingType:", msg.meetingType);
      }
    });
    sendResponse({ status: "saved" });
  }
  
  // Handle finding a meeting tab (used by popup.js)
  if (msg.type === "find-meeting-tab") {
    // First try Google Meet
    chrome.tabs.query({ url: "*://meet.google.com/*" }, (meetTabs) => {
      if (chrome.runtime.lastError) {
        console.error("Error querying Google Meet tabs:", chrome.runtime.lastError);
        sendResponse({ found: false });
        return;
      }
      if (meetTabs.length > 0) {
        const tabId = meetTabs[0].id;
        meetingTabs.set(tabId, { id: tabId, meetingType: "google-meet" });
        chrome.storage.local.set({ 
          meetingTabId: tabId,
          meetingType: "google-meet"
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving auto-detected Google Meet tab to local storage:", chrome.runtime.lastError);
            sendResponse({ found: false });
          } else {
            console.log("Auto-detected Google Meet tab:", tabId);
            sendResponse({ found: true, meetingTabId: tabId, meetingType: "google-meet" });
          }
        });
      } else {
        // Then try Zoom
        chrome.tabs.query({ url: "*://*.zoom.us/*" }, (tabsUs) => {
          if (chrome.runtime.lastError) {
            console.error("Error querying Zoom .us tabs:", chrome.runtime.lastError);
            sendResponse({ found: false });
            return;
          }
          chrome.tabs.query({ url: "*://*.zoom.com/*" }, (tabsCom) => {
            if (chrome.runtime.lastError) {
              console.error("Error querying Zoom .com tabs:", chrome.runtime.lastError);
              sendResponse({ found: false });
              return;
            }
            chrome.tabs.query({ url: "*://*.zoomgov.com/*" }, (tabsGov) => {
              if (chrome.runtime.lastError) {
                console.error("Error querying Zoom .gov tabs:", chrome.runtime.lastError);
                sendResponse({ found: false });
                return;
              }
              const allTabs = [...tabsUs, ...tabsCom, ...tabsGov];
              if (allTabs.length > 0) {
                const tabId = allTabs[0].id;
                meetingTabs.set(tabId, { id: tabId, meetingType: "zoom" });
                chrome.storage.local.set({ 
                  meetingTabId: tabId,
                  meetingType: "zoom"
                }, () => {
                  if (chrome.runtime.lastError) {
                    console.error("Error saving auto-detected Zoom tab to local storage:", chrome.runtime.lastError);
                    sendResponse({ found: false });
                  } else {
                    console.log("Auto-detected Zoom tab:", tabId);
                    sendResponse({ found: true, meetingTabId: tabId, meetingType: "zoom" });
                  }
                });
              } else {
                sendResponse({ found: false });
              }
            });
          });
        });
      }
    });
    return true; // Indicates that sendResponse will be called asynchronously
  }
  
  // Register a transcript iframe tab
  if (msg.type === "register-transcript") {
    if (sender.tab && sender.tab.id) {
      transcriptTabs.set(sender.tab.id, true);
      // Also save the transcript tab ID to local storage for persistence
      chrome.storage.local.set({ transcriptTabId: sender.tab.id }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving transcriptTabId to local storage:", chrome.runtime.lastError);
        } else {
          console.log("Registered transcript tab:", sender.tab.id);
        }
      });
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: "Sender tab ID not available." });
    }
    return true;
  }
  
  // Clear captions
  if (msg.type === "clear-captions") {
    chrome.storage.local.set({ captions: [] }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error clearing captions:", chrome.runtime.lastError);
      } else {
        console.log("Captions cleared.");
      }
    });
    sendResponse({ status: "cleared" });
  }
  
  // Ping for liveness check
  if (msg.type === "ping") {
    sendResponse({ status: "alive" });
  }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  if (meetingTabs.has(tabId)) {
    meetingTabs.delete(tabId);
    chrome.storage.local.remove(["meetingTabId", "meetingType"], () => {
      if (chrome.runtime.lastError) {
        console.error("Error removing meetingTabId from local storage:", chrome.runtime.lastError);
      }
    });
    console.log("Meeting tab removed:", tabId);
    
    // Notify all active transcript tabs that the meeting tab was closed
    transcriptTabs.forEach((value, transcriptTabId) => {
      chrome.tabs.sendMessage(transcriptTabId, { 
        type: "meeting-tab-closed" 
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn(`Could not send 'meeting-tab-closed' to transcript tab ${transcriptTabId}:`, chrome.runtime.lastError.message);
          // If the transcript tab is also gone, remove it from our map
          transcriptTabs.delete(transcriptTabId);
          chrome.storage.local.remove("transcriptTabId"); // Also remove from storage
        }
      });
    });
  }
  
  if (transcriptTabs.has(tabId)) {
    transcriptTabs.delete(tabId);
    chrome.storage.local.remove("transcriptTabId", () => {
      if (chrome.runtime.lastError) {
        console.error("Error removing transcriptTabId from local storage:", chrome.runtime.lastError);
      }
    });
    console.log("Transcript tab removed:", tabId);
  }
});

// Listen for tab updates to detect when a meeting might have ended or started
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const isMeeting = tab.url.includes("meet.google.com") || 
                      tab.url.includes("zoom.us") || 
                      tab.url.includes("zoom.com") || 
                      tab.url.includes("zoomgov.com");
    
    if (isMeeting) {
      const meetingType = tab.url.includes("meet.google.com") ? "google-meet" : "zoom";
      // Only update if it's a new meeting tab or type has changed
      if (!meetingTabs.has(tabId) || meetingTabs.get(tabId).meetingType !== meetingType) {
        meetingTabs.set(tabId, { id: tabId, meetingType: meetingType });
        chrome.storage.local.set({ 
          meetingTabId: tabId,
          meetingType: meetingType
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error updating meetingTabId on tab update:", chrome.runtime.lastError);
          } else {
            console.log("Updated/Detected meeting tab:", tabId, "Type:", meetingType);
          }
        });
      }
    } else if (meetingTabs.has(tabId)) {
      // If a tab that was a meeting tab navigates away, remove it
      meetingTabs.delete(tabId);
      chrome.storage.local.remove(["meetingTabId", "meetingType"], () => {
        if (chrome.runtime.lastError) {
          console.error("Error removing meetingTabId on non-meeting tab update:", chrome.runtime.lastError);
        }
      });
      console.log("Meeting tab navigated away:", tabId);

      // Notify transcript tabs that the meeting tab was closed
      transcriptTabs.forEach((value, transcriptTabId) => {
        chrome.tabs.sendMessage(transcriptTabId, { 
          type: "meeting-tab-closed" 
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn(`Could not send 'meeting-tab-closed' to transcript tab ${transcriptTabId}:`, chrome.runtime.lastError.message);
            transcriptTabs.delete(transcriptTabId);
            chrome.storage.local.remove("transcriptTabId");
          }
        });
      });
    }
  }
});

// Function to send captions to transcript tab
function sendCaptionsToTranscript(captions) {
  chrome.storage.local.get(["transcriptTabId"], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Error getting transcriptTabId from local storage:", chrome.runtime.lastError);
      return;
    }
    if (result.transcriptTabId) {
      chrome.tabs.sendMessage(result.transcriptTabId, {
        type: "update-captions",
        captions: captions
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("Could not send captions to transcript tab:", chrome.runtime.lastError.message);
          // If the transcript tab is gone, remove it from our map and storage
          transcriptTabs.delete(result.transcriptTabId);
          chrome.storage.local.remove("transcriptTabId");
        }
      });
    }
  });
}

// Listen for storage changes to update transcript tab
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.captions) {
    sendCaptionsToTranscript(changes.captions.newValue);
  }
});