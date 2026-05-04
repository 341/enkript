const relayEl = document.getElementById('relay');
const payloadEl = document.getElementById('payload');
document.getElementById('wire').addEventListener('click', async () => {
  try {
    const pairing = JSON.parse(payloadEl?.value ?? '{}');
    const relayUrl = relayEl?.value || pairing.relay;
    await chrome.runtime.sendMessage({ type: "RELAY_ARM",
      payload: { relayUrl, sessionId: pairing.sessionId, secret: pairing.secret },
    });
    chrome.tabs.query({ active: true }, (tabs) => {
      chrome.scripting.executeScript?.({
        target: { tabId: tabs?.[0]?.id },
        func: () => console.log('[vault] relay armed'),
      });
    });
    alert('Channel requested — watch content logs.');
  } catch (error) {
    alert(String(error));
  }
});

