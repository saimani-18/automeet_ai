// content.js
(function () {
  // Prevent duplicate sidebar
  if (document.getElementById("autommeet-sidebar")) {
    document.getElementById("autommeet-sidebar").remove();
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("sidebar.html");
  iframe.id = "autommeet-sidebar";

  // Docked sidebar
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.right = "0";
  iframe.style.width = "360px";
  iframe.style.height = "100%";
  iframe.style.zIndex = "2147483647"; // Max priority
  iframe.style.border = "none";
  iframe.style.background = "transparent";
  iframe.style.boxShadow = "0 0 20px rgba(0,0,0,0.5)";

  document.body.appendChild(iframe);
})();
