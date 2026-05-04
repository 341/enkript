let activeSocket;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

      ws.addEventListener('message', (evt) => {
        chrome.storage.local.set({
          vaultBridgeLastPulse: `${Date.now()} ${String(evt.data).slice(0, 280)}`,
        });
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

