const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use(express.static(__dirname));

const rooms = {};
const MAX_PLAYERS = 10;

const characters = {
  Guerrero: "#e74c3c",
  Mago: "#8e44ad",
  Arquera: "#27ae60",
  Guardian: "#3498db",
  Sombra: "#34495e",
  Druida: "#f1c40f"
};

function makeCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function sendRoom(code) {
  const room = rooms[code];
  if (!room) return;

  io.to(code).emit("state", {
    players: Object.values(room.players),
    map: room.map
  });
}

io.on("connection", socket => {
  socket.on("createRoom", data => {
    let code = makeCode();

    while (rooms[code]) code = makeCode();

    rooms[code] = {
      map: data.map || "Bosque",
      players: {}
    };

    joinPlayer(socket, code, data.character);
  });

  socket.on("joinRoom", data => {
    const code = String(data.code || "").toUpperCase();
    const room = rooms[code];

    if (!room) {
      socket.emit("errorMessage", "No existe esa sala.");
      return;
    }

    if (Object.keys(room.players).length >= MAX_PLAYERS) {
      socket.emit("errorMessage", "La sala está llena.");
      return;
    }

    joinPlayer(socket, code, data.character);
  });

  function joinPlayer(socket, code, character) {
    const room = rooms[code];

    if (Object.keys(room.players).length >= MAX_PLAYERS) {
      socket.emit("errorMessage", "La sala está llena.");
      return;
    }

    const selected = characters[character] ? character : "Guerrero";

    socket.join(code);
    socket.data.room = code;

    room.players[socket.id] = {
      id: socket.id,
      name: selected,
      character: selected,
      color: characters[selected],
      x: 400 + Math.random() * 100,
      y: 250 + Math.random() * 60,
      hp: 100,
      score: 0,
      attacking: false
    };

    socket.emit("joined", { code, id: socket.id });
    sendRoom(code);
  }

  socket.on("move", data => {
    const code = socket.data.room;
    const room = rooms[code];
    if (!room || !room.players[socket.id]) return;

    const player = room.players[socket.id];

    player.x = Math.max(25, Math.min(875, Number(data.x) || player.x));
    player.y = Math.max(25, Math.min(515, Number(data.y) || player.y));

    sendRoom(code);
  });

  socket.on("changeMap", map => {
    const code = socket.data.room;
    if (!rooms[code]) return;

    const allowed = ["Bosque", "Volcan", "Hielo", "Ruinas", "Desierto", "Castillo"];
    if (allowed.includes(map)) {
      rooms[code].map = map;
      sendRoom(code);
    }
  });

  socket.on("attack", () => {
    const code = socket.data.room;
    const room = rooms[code];
    if (!room || !room.players[socket.id]) return;

    const attacker = room.players[socket.id];
    const now = Date.now();

    if (attacker.lastAttack && now - attacker.lastAttack < 700) return;
    attacker.lastAttack = now;
    attacker.attacking = true;

    for (const id in room.players) {
      if (id === socket.id) continue;

      const enemy = room.players[id];
      const dx = enemy.x - attacker.x;
      const dy = enemy.y - attacker.y;

      if (Math.sqrt(dx * dx + dy * dy) < 85) {
        enemy.hp -= 25;

        if (enemy.hp <= 0) {
          enemy.hp = 100;
          enemy.x = 400 + Math.random() * 100;
          enemy.y = 250 + Math.random() * 60;
          attacker.score++;
        }
      }
    }

    sendRoom(code);

    setTimeout(() => {
      if (room.players[socket.id]) {
        room.players[socket.id].attacking = false;
        sendRoom(code);
      }
    }, 250);
  });

  socket.on("disconnect", () => {
    const code = socket.data.room;
    if (!code || !rooms[code]) return;

    delete rooms[code].players[socket.id];

    if (Object.keys(rooms[code].players).length === 0) {
      delete rooms[code];
    } else {
      sendRoom(code);
    }
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("Arena Insana funcionando en el puerto " + PORT);
});
