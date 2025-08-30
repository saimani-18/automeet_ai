// Inject floating AutoMeet button into pages
(function(){
  if (document.body.dataset.automeetInjected) return;
  document.body.dataset.automeetInjected = "1";

  const btn = document.createElement('button');
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="20" height="20" viewBox="0 0 24 24">
      <path d="M13 2L3 14h7v8l11-13h-8z"/>
    </svg>
    <span style="margin-left:6px;">AutoMeet</span>
  `;
  Object.assign(btn.style, {
    position: 'fixed',
    right: '18px',
    bottom: '22px',
    zIndex: 2147483647,
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(90deg,#7c3aed,#ff2d95)',
    color: '#fff',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 6px 24px rgba(124,58,237,0.18)',
    cursor: 'pointer'
  });

  btn.onclick = () => {
    window.open(chrome.runtime.getURL('popup.html'), '_blank', 'noopener');
  };

  document.body.appendChild(btn);
})();
