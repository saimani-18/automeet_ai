const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const backBtn = document.getElementById("backBtn");

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerText = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

sendBtn.addEventListener("click", () => {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage(text, "user");
  userInput.value = "";

  setTimeout(() => {
    addMessage("🤖 Demo Reply: This is a placeholder. (Backend will integrate later)", "bot");
  }, 600);
});

backBtn.addEventListener("click", () => {
  window.location.href = "popup.html";
});
