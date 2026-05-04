import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT || 8787);
const rooms = new Map(); // sessionId -> Set<WebSocket>

const wss = new WebSocketServer({ port: PORT });

function ensureRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  return rooms.get(roomId);
}

wss.on('connection', (socket) => {
  let roomKey = '';

  socket.on('message', (raw) => {
    let envelope;
    try {
      envelope = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (typeof envelope.sessionId !== 'string') return;
    roomKey = envelope.sessionId;
    ensureRoom(roomKey).add(socket);

    for (const client of rooms.get(roomKey) ?? []) {
      if (client !== socket && client.readyState === socket.OPEN) {
        client.send(JSON.stringify(envelope.payload ?? envelope));
      }
    }
  });

  socket.on('close', () => {
    if (!roomKey) return;
    const bucket = rooms.get(roomKey);
    bucket?.delete(socket);
    if (bucket?.size === 0) rooms.delete(roomKey);
  });
});

console.log('[vault-relay]', `listening:${PORT}`);
