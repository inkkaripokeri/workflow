const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const LED_COUNT = 14; // 🔥 FIX: vastaa UI:ta

let leds, bullets, score, running, lastMove, spawnGap;
let pendingGameOver = false; // 🔥 uusi

const ROLES = ["designer", "developer", "tester"];
const letters = ["A", "B", "C"];

let lobby = {};
let gameState = "waiting";

function newLobby() {
  lobby = {
    code: Math.floor(Math.random() * 10000).toString().padStart(4, "0"),
    players: {
      designer: null,
      developer: null,
      tester: null
    }
  };
  gameState = "waiting";
}

function resetGame() {
  leds = Array(LED_COUNT).fill(null);
  bullets = [];
  score = 0;
  running = false;
  spawnGap = 0;
  pendingGameOver = false; // 🔥 reset
}

newLobby();
resetGame();

function randomLetter() {
  return letters[Math.floor(Math.random() * letters.length)];
}

function randomColor() {
  return ["red", "green", "blue"][Math.floor(Math.random() * 3)];
}

function spawnTop() {
  if (spawnGap > 0) {
    leds[0] = null;
    spawnGap--;
    return;
  }

  leds[0] = { color: randomColor(), letter: randomLetter() };
  spawnGap = Math.floor(Math.random() * 3) + 1;
}

function getFirstBlockingIndex() {
  for (let i = LED_COUNT - 1; i >= 0; i--) {
    if (leds[i]) return i;
  }
  return -1;
}

setInterval(() => {

  if (!running) {
    io.emit("state", { leds, bullets, score, running, lobby, gameState });
    return;
  }

  const now = Date.now();

  if (now - lastMove > 500) {

    // 🔥 jos viime tickillä jäi task viimeiseen → nyt peli loppuu
    if (pendingGameOver) {
      running = false;
      gameState = "gameover";
      pendingGameOver = false;
    } else {

      // 🔥 siirretään ledit
      for (let i = LED_COUNT - 1; i > 0; i--) {
        leds[i] = leds[i - 1];
      }

      spawnTop();
      lastMove = now;

      // 🔥 jos nyt tuli task viimeiseen → anna yksi tick aikaa
      if (leds[LED_COUNT - 1]) {
        pendingGameOver = true;
      }
    }
  }

  // 🔥 bullets liike
  bullets.forEach(b => b.y -= 0.5);

  bullets = bullets.filter(b => {
    const target = getFirstBlockingIndex();
    if (target === -1) return false;

    const led = leds[target];

    if (Math.abs(b.y - target) < 0.5) {
      if (led.color === b.color && led.letter === b.letter) {
        leds[target] = null;
        score++;
      } else {
        score = Math.max(0, score - 1);
      }
      return false;
    }

    return b.y >= 0;
  });

  io.emit("state", { leds, bullets, score, running, lobby, gameState });

}, 1000/60);

io.on("connection", (socket) => {

  socket.on("resetLobby", () => {
    newLobby();
    resetGame();
  });

  socket.on("join", ({ code, role, name }) => {

    if (!ROLES.includes(role)) return;
    if (code !== lobby.code) return;
    if (lobby.players[role]) return;

    lobby.players[role] = { id: socket.id, name };
    socket.data.role = role;

    const count = Object.values(lobby.players).filter(Boolean).length;

    if (count === 3) gameState = "ready";

    socket.emit("joinResult", { ok: true });
  });

  socket.on("start", () => {
    const count = Object.values(lobby.players).filter(Boolean).length;

    if (count === 3) {
      running = true;
      gameState = "running";
      lastMove = Date.now();
      pendingGameOver = false; // 🔥 varmistus
    }
  });

  socket.on("disconnect", () => {
    const role = socket.data.role;
    if (role && lobby.players[role]?.id === socket.id) {
      lobby.players[role] = null;
    }
  });

});

server.listen(3000, () => console.log("Server running"));
