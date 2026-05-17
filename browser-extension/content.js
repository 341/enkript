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

function applyFillToForm(username, password) {
  const userEl =
    document.querySelector('input[type="email"], input[autocomplete="username"], input[name*="user" i]') ??
    document.querySelector('input[type="text"]');
  const passEl = document.querySelector('input[type="password"]');
  if (userEl && username) {
    userEl.value = username;
    userEl.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if (passEl && password) {
    passEl.value = password;
    passEl.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === 'RELAY_PAYLOAD') {
    console.info('[vault-bridge]', msg.payload);
  }
  if (msg?.type === 'VAULT_FILL' && msg.payload) {
    applyFillToForm(msg.payload.username, msg.payload.password);
  }
});

document.getElementById('vault-mini-assist-root')?.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'VAULT_REQUEST_FILL', domain: location.hostname });
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

