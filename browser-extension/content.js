function injectAssistControl() {
  if (document.getElementById('vault-mini-assist-root')) return;
  const overlay = document.createElement('button');
  overlay.id = 'vault-mini-assist-root';
  overlay.textContent = '🔑';
  overlay.style.position = 'fixed';
  overlay.style.right = '12px';
  overlay.style.bottom = '80px';
  overlay.style.width = '40px';
  overlay.style.height = '40px';
  overlay.style.borderRadius = '20px';
  overlay.style.border = 'none';
  overlay.style.boxShadow = '0 12px 32px rgba(0,0,0,0.45)';
  overlay.style.background = 'linear-gradient(135deg,#4F46E5,#7C3AED)';
  overlay.style.color = '#F8FAFC';
  overlay.style.cursor = 'pointer';
  overlay.style.zIndex = '2147483644';
  document.body?.appendChild(overlay);
}

injectAssistControl();

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === 'RELAY_PAYLOAD') {
    console.info('[vault-bridge]', msg.payload);
  }
});

const originalCreate = navigator.credentials?.create?.bind(navigator.credentials);
if (navigator.credentials?.create && originalCreate) {
  navigator.credentials.create = async (options = {}) => {
    console.warn('[vault] intercept PASSKEY CREATE', options);
    return originalCreate(options);
  };
}

const originalGet = navigator.credentials?.get?.bind(navigator.credentials);
if (navigator.credentials?.get && originalGet) {
  navigator.credentials.get = async (opts = {}) => {
    console.warn('[vault] intercept PASSKEY GET', opts);
    return originalGet(opts);
  };
}

