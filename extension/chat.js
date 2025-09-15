// chat.js
const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const backBtn = document.getElementById("backBtn");
const closeBtn = document.getElementById("closeBtn");
const dragBar = document.getElementById("dragBar");

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerText = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage(text, "user");
  userInput.value = "";

  setTimeout(() => {
    addMessage("🤖 Demo Reply: This is a placeholder. (Backend will integrate later)", "bot");
  }, 600);
}

sendBtn.addEventListener("click", handleSend);

// 🔥 New: allow pressing Enter to send
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // stops newline
    handleSend();
  }
});

backBtn.addEventListener("click", () => {
  window.location.href = "popup.html";
});

closeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  window.parent.postMessage("close-autommeet", "*");
});

// Setup drag functionality
dragBar.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  window.parent.postMessage(
    {
      type: "dragStart",
      clientX: e.clientX,
      clientY: e.clientY
    },
    "*"
  );
  e.preventDefault();
});
