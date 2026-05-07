const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const LED_COUNT = 14;

let leds, bullets, score, running, lastMove, spawnGap;
let pendingGameOver = false;

// 🔥 LEVEL SPEED (Q1 default)
let moveInterval = 1000;

const ROLES = ["designer", "developer", "tester"];

// 🔥 kaikki taskit
const TASKS = [
  { role: "designer", color: "#f39c12", task: "WIREFRAME" },
  { role: "designer", color: "#f39c12", task: "PROTOTYPE" },
  { role: "designer", color: "#f39c12", task: "USER RESEARCH" },

  { role: "developer", color: "#6c5ce7", task: "NEW FEATURE" },
  { role: "developer", color: "#6c5ce7", task: "BUGFIX" },
  { role: "developer", color: "#6c5ce7", task: "REFACTOR" },

  { role: "tester", color: "#00b894", task: "SMOKE TEST" },
  { role: "tester", color: "#00b894", task: "UNIT TEST" },
  { role: "tester", color: "#00b894", task: "BUG REPORT" }
];

function randomTask() {
  return TASKS[Math.floor(Math.random() * TASKS.length)];
}

let lobby = {};
let gameState = "waiting";

/* 🔥 LEVEL LOGIC */
function updateLevelSpeed() {

  if (score >= 30) {
    moveInterval = 250; // Q4
  } else if (score >= 20) {
    moveInterval = 500; // Q3
  } else if (score >= 10) {
    moveInterval = 750; // Q2
  } else {
    moveInterval = 1000; // Q1
  }

}

function getLevel() {
  if (score >= 30) return "Q4";
  if (score >= 20) return "Q3";
  if (score >= 10) return "Q2";
  return "Q1";
}

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
  pendingGameOver = false;

  moveInterval = 1000; // 🔥 takaisin Q1
}

newLobby();
resetGame();

function spawnTop() {
  if (spawnGap > 0) {
    leds[0] = null;
    spawnGap--;
    return;
  }

  const t = randomTask();

  leds[0] = {
    role: t.role,
    color: t.color,
    task: t.task
  };

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
    io.emit("state", {
      leds,
      bullets,
      score,
      level: getLevel(), // 🔥 LISÄTTY
      running,
      lobby,
      gameState
    });
    return;
  }

  const now = Date.now();

  if (now - lastMove > moveInterval) {

    if (pendingGameOver) {
      running = false;
      gameState = "gameover";
      pendingGameOver = false;
    } else {

      for (let i = LED_COUNT - 1; i > 0; i--) {
        leds[i] = leds[i - 1];
      }

      spawnTop();
      lastMove = now;

      if (leds[LED_COUNT - 1]) {
        pendingGameOver = true;
      }
    }
  }

  // 🔥 BULLET MOVEMENT
  bullets.forEach(b => b.y -= 0.5);

  bullets = bullets.filter(b => {

    const target = getFirstBlockingIndex();
    if (target === -1) return b.y >= 0;

    const led = leds[target];
    if (!led) return b.y >= 0;

    if (Math.abs(b.y - target) < 0.5) {

      if (led.role === b.role && led.task === b.task) {

        leds[target] = null;
        score++;

        updateLevelSpeed(); // 🔥 LISÄTTY

        io.emit("hit", { index: target, success: true });

      } else {

        score = Math.max(0, score - 1);

        updateLevelSpeed(); // 🔥 LISÄTTY

        io.emit("hit", { index: target, success: false });
      }

      return false;
    }

    return b.y >= 0;
  });

  io.emit("state", {
    leds,
    bullets,
    score,
    level: getLevel(), // 🔥 TÄMÄ PUUTTUU
    running,
    lobby,
    gameState
  });

}, 1000 / 60);

io.on("connection", (socket) => {

  // 🔥 AUTO RESET (refresh bug fix)
  if (!running && gameState === "gameover") {
    console.log("🧼 AUTO RESET AFTER GAMEOVER");
    newLobby();
    resetGame();
  }

  // 🔥 HOSTIN RESET NAPPI
  socket.on("resetLobby", () => {

    console.log("🔄 RESET LOBBY");

    newLobby();
    resetGame();

  });

  socket.on("join", ({ code, role, name }) => {

    if (!ROLES.includes(role)) return;
    if (code !== lobby.code) return;
    if (lobby.players[role]) return;

    lobby.players[role] = { id: socket.id, name };
    socket.data.role = role;
    socket.data.code = code;

    const count = Object.values(lobby.players).filter(Boolean).length;

    if (count === 3) gameState = "ready";

    socket.emit("joinResult", { ok: true });
  });

  socket.on("start", () => {

    console.log("🔥 START RECEIVED");

    const count = Object.values(lobby.players).filter(Boolean).length;

    if (count === 3) {

      resetGame();

      running = true;
      gameState = "running";
      lastMove = Date.now();
      pendingGameOver = false;
    }
  });

  socket.on("shoot", ({ role, task }) => {

    if (socket.data.code !== lobby.code) return;
    if (!running) return;

    bullets.push({
      y: LED_COUNT - 1,
      role,
      task
    });
  });

  socket.on("restartGame", () => {

    const count = Object.values(lobby.players).filter(Boolean).length;

    if (count === 3) {
      console.log("🔄 RESTART GAME");

      resetGame();

      running = true;
      gameState = "running";
      lastMove = Date.now();
      pendingGameOver = false;
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
