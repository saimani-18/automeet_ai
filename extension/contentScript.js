// Inject popup.html as a sticky floating panel
(function () {
  // Toggle if already exists
  if (document.getElementById("autommeet-panel")) {
    document.getElementById("autommeet-panel").remove();
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("popup.html");
  iframe.id = "autommeet-panel";

  Object.assign(iframe.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "360px",
    height: "440px",
    border: "none",
    borderRadius: "16px",
    zIndex: "2147483647",
    boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
    background: "transparent"
  });

  document.body.appendChild(iframe);
})();
