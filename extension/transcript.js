const transcriptBox = document.getElementById("transcriptBox");
const backBtn = document.getElementById("backBtn");

// Go back to popup
backBtn.addEventListener("click", () => {
  window.location.href = "popup.html";
});

// DEMO: Fake live transcript generator
const demoLines = [
  "Welcome everyone, let's start the meeting.",
  "Today we’ll discuss the project milestones.",
  "Please check the updated design document.",
  "Does anyone have questions about Sprint 2?",
  "We’ll finalize tasks by tomorrow."
];

let i = 0;
function addLine() {
  if (i < demoLines.length) {
    const p = document.createElement("p");
    p.textContent = demoLines[i];
    transcriptBox.appendChild(p);
    transcriptBox.scrollTop = transcriptBox.scrollHeight;
    i++;
    setTimeout(addLine, 2000); // new line every 2 sec
  }
}
addLine(); // start demo transcript
