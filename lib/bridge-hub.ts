import type { BridgeMessage } from '@/lib/bridge-protocol';

export type BridgeWireStatus = 'offline' | 'connected' | 'relay';

type MessageHandler = (msg: BridgeMessage) => void;

let handler: MessageHandler | undefined;
let statusUpdate: ((s: BridgeWireStatus) => void) | undefined;

export function registerBridgeMessageHandler(
  h: MessageHandler,
  onStatus?: (s: BridgeWireStatus) => void,
) {
  handler = h;
  statusUpdate = onStatus;
}

let socket: WebSocket | null = null;

export function disconnectBridge() {
  socket?.close();
  socket = null;
  statusUpdate?.('offline');
}

/** Client role over relay or LAN WebSocket URL. */
export function connectBridgeRelay(url: string) {
  disconnectBridge();
  statusUpdate?.('relay');
  const ws = new WebSocket(url);
  socket = ws;
  ws.onopen = () => {
    statusUpdate?.('connected');
    ws.send(JSON.stringify({ type: 'PING' } satisfies BridgeMessage));
  };
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(String(event.data)) as BridgeMessage;
      handler?.(msg);
    } catch {
      /**/
    }
  };
  ws.onerror = () => {
    statusUpdate?.('relay');
  };
  ws.onclose = () => {
    socket = null;
    statusUpdate?.('offline');
  };
}

export function sendBridgeMessage(message: BridgeMessage) {
  const ws = socket;
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(message));
}
