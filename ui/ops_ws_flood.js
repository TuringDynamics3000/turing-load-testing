const WebSocket = require('ws');
const WS_URL = process.env.TURING_WS_URL || 'ws://localhost:8080';
const CLIENT_COUNT = 300;

console.log(`🌊 Connecting ${CLIENT_COUNT} clients...`);
let connected = 0;

for (let i = 0; i < CLIENT_COUNT; i++) {
  const ws = new WebSocket(WS_URL);
  ws.on('open', () => {
    connected++;
    console.log(`✅ Client ${i + 1}/${CLIENT_COUNT} connected`);
  });
  ws.on('error', (err) => console.error(`❌ Error:`, err.message));
}
