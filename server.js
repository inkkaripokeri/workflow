const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const LED_COUNT = 50;

let leds, bullets, score, running;
let lastMove, spawnGap;

const moveInterval = 500;

const ROLES = ["designer", "developer", "tester"];
const letters = ["A", "B", "C"];

let lobby = {};
let gameState = "waiting"; 
// waiting | ready | running | gameover

// =========================
// LOBBY
// =========================
function newLobby() {
  lobby = {
    code: Math.floor(1000 + Math.random() * 9000).toString(),
    players: {
      designer: null,
      developer: null,
      tester: null
    }
  };

  gameState = "waiting";
}

newLobby();

// =========================
// GAME RESET
// =========================
function resetGame() {
  leds = Array(LED_COUNT).fill(null);
  bullets = [];
  score = 0;
  running = false;
  spawnGap = 0;
  gameState = "waiting";
}

resetGame();

// =========================
// HELPERS
// =========================
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

  leds[0] = {
    color: randomColor(),
    letter: randomLetter()
  };

  spawnGap = Math.floor(Math.random() * 3) + 1;
}

function getFirstBlockingIndex() {
  for (let i = LED_COUNT - 1; i >= 0; i--) {
    if (leds[i]) return i;
  }
  return -1;
}

// =========================
// GAME LOOP
// =========================
setInterval(() => {

  if (!running) {
    io.emit("state", { leds, bullets, score, running, lobby, gameState });
    return;
  }

  const now = Date.now();

  if (now - lastMove > moveInterval) {

    // GAME OVER CONDITION
    if (leds[LED_COUNT - 1]) {
      running = false;
      gameState = "gameover";
    }

    for (let i = LED_COUNT - 1; i > 0; i--) {
      leds[i] = leds[i - 1];
    }

    spawnTop();
    lastMove = now;
  }

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

}, 1000 / 60);

// =========================
// SOCKET HANDLING
// =========================
io.on("connection", (socket) => {

  socket.on("resetLobby", () => {
    newLobby();
    resetGame();
  });

  // JOIN
  socket.on("join", ({ code, role, name }) => {

    if (!ROLES.includes(role)) {
      socket.emit("joinResult", { ok: false, msg: "Invalid role" });
      return;
    }

    if (code !== lobby.code) {
      socket.emit("joinResult", { ok: false, msg: "Wrong code" });
      return;
    }

    if (lobby.players[role]) {
      socket.emit("joinResult", { ok: false, msg: "Role already taken" });
      return;
    }

    lobby.players[role] = {
      id: socket.id,
      name
    };

    socket.data.role = role;

    // 👉 UPDATE GAME STATE AUTOMATICALLY
    const count = Object.values(lobby.players).filter(Boolean).length;

    if (count === 3) {
      gameState = "ready";
    }

    socket.emit("joinResult", { ok: true, role, name });
  });

  // START GAME
  socket.on("start", () => {
    const count = Object.values(lobby.players).filter(Boolean).length;

    if (count === 3 && gameState === "ready") {
      running = true;
      gameState = "running";
      lastMove = Date.now();
    }
  });

  socket.on("shoot", ({ color, letter }) => {
    if (!running) return;

    bullets.push({
      y: LED_COUNT - 1,
      color,
      letter
    });
  });

  socket.on("disconnect", () => {
    const role = socket.data.role;

    if (role && lobby.players[role]?.id === socket.id) {
      lobby.players[role] = null;
    }

    // downgrade state if someone leaves
    const count = Object.values(lobby.players).filter(Boolean).length;
    if (count < 3 && gameState !== "gameover") {
      gameState = "waiting";
      running = false;
    }
  });

});

server.listen(3000, () => console.log("Server running"));
