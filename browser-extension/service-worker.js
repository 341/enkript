let activeSocket;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'VAULT_REQUEST_FILL') {
    const domain = message.domain ?? '';
    if (activeSocket?.readyState === WebSocket.OPEN) {
      activeSocket.send(
        JSON.stringify({
          sessionId: message.sessionId,
          payload: { type: 'QUERY_CREDENTIALS', domain },
        }),
      );
    }
    sendResponse?.({ ok: true });
    return;
  }

  if (message?.type !== 'RELAY_ARM') {
    sendResponse?.({ ok: false });
    return;
  }

  const { relayUrl, sessionId, secret } = message.payload ?? {};
  if (!relayUrl || !sessionId || !secret) {
    sendResponse?.({ ok: false });
    return;
  }

  try {
    activeSocket?.close();
    const ws = new WebSocket(relayUrl);
    activeSocket = ws;

    ws.addEventListener('open', () => {
      ws.send(
        JSON.stringify({
          sessionId,
          payload: {
            type: 'PAIR_PROBE',
            proof: secret,
            label: 'Browser extension scaffold',
            ua: navigator?.userAgent ?? 'extension',
          },
        }),
      );

      ws.addEventListener('message', async (evt) => {
        chrome.storage.local.set({
          vaultBridgeLastPulse: `${Date.now()} ${String(evt.data).slice(0, 280)}`,
        });
        try {
          const frame = JSON.parse(String(evt.data));
          const payload = frame?.payload ?? frame;
          if (payload?.type === 'CREDENTIALS_RESPONSE') {
            await chrome.storage.local.set({ vaultBridgeCredentials: payload.entries ?? [] });
          }
          if (payload?.type === 'FILL_APPROVED') {
            await chrome.storage.local.set({
              vaultBridgePendingFill: {
                username: payload.username,
                password: payload.password,
                at: Date.now(),
              },
            });
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              const tabId = tabs[0]?.id;
              if (tabId) {
                chrome.tabs.sendMessage(tabId, { type: 'VAULT_FILL', payload });
              }
            });
          }
        } catch {
          /**/
        }
      });

      sendResponse?.({ ok: true });
    });

    ws.addEventListener('error', () => sendResponse?.({ ok: false }));
    ws.addEventListener('close', () => {
      if (activeSocket === ws) {
        activeSocket = undefined;
      }
    });

    return true;
  } catch {
    sendResponse?.({ ok: false });
    return false;
  }
});

