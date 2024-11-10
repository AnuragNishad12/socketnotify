const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware to parse JSON
app.use(express.json());

// Test API endpoint
app.get('/', (req, res) => {
  res.send('WebSocket Notification Server is running');
});

// Store connected WebSocket clients
let clients = [];

// Handle WebSocket connection
wss.on('connection', (ws) => {
  // Add client to the list
  clients.push(ws);
  console.log('New client connected');
  
  // Remove client from list on disconnect
  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
    console.log('Client disconnected');
  });
});

// Endpoint to send notification
app.post('/send-notification', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Send message to all connected clients
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ message }));
    }
  });

  res.json({ success: true, message: 'Notification sent to all clients' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
