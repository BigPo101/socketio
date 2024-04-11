const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const PORT = 3000;

app.use(bodyParser.json());

let nextRoomId = 1;

// Store rooms as a property of the app object
app.locals.rooms = {};

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0 }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/host', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'host.html'));
});

app.get('/room', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

app.post('/createRoom', (req, res) => {
  const roomId = nextRoomId++;
  const roomCode = generateRoomCode();
  app.locals.rooms[roomCode] = { id: roomId, players: [] };
  res.json({ roomCode });
});

app.post('/joinRoom/:code', (req, res) => {
  const { code } = req.params;
  if (app.locals.rooms[code]) {
    // Add logic to join the room (e.g., add player to room)
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.post('/sendPlayerName/:code', (req, res) => {
  const { code } = req.params;
  const { playerName } = req.body;

  if (app.locals.rooms[code]) {
      app.locals.rooms[code].players.push(playerName); // Store player's name in the room
      res.json({ success: true });
  } else {
      res.json({ success: false });
  }
});

function generateRoomCode() {
  // Generate a random 6-character alphanumeric room code
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});