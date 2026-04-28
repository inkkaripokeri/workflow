const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const ledCount = 20;
let leds = Array(ledCount).fill("gray");
let shots = [];
let score = 0;

let gameState = "lobby"; // lobby | countdown | playing
let players = {}; // socket.id -> color

const colors = ["red", "green", "blue"];

// JOIN PLAYER
io.on("connection", (socket) => {

  socket.on("join", (color) => {
    players[socket.id] = color;
    io.emit("lobby", { playerCount: Object.keys(players).length });
  });

  socket.on("startGame", () => {
    if (Object.keys(players).length < 3) return;
    startCountdown();
  });

  socket.on("shoot", (color) => {
    if (gameState !== "playing") return;
    shots.push({ index: ledCount - 1, color });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("lobby", { playerCount: Object.keys(players).length });
  });

});

function startCountdown() {
  gameState = "countdown";
  let count = 3;

  io.emit("countdown", count);

  const interval = setInterval(() => {
    count--;

    if (count > 0) {
      io.emit("countdown", count);
    } else {
      clearInterval(interval);
      startGame();
    }
  }, 1000);
}

function startGame() {
  gameState = "playing";
  leds = Array(ledCount).fill("gray");
  shots = [];
  score = 0;
  io.emit("gameStart");
}

setInterval(() => {

  if (gameState !== "playing") {
    io.emit("state", { leds, score, gameState });
    return;
  }

  if (leds[ledCount - 1] !== "gray") {
    leds = Array(ledCount).fill("gray");
    shots = [];
    score = 0;
  }

  for (let i = ledCount - 1; i > 0; i--) {
    leds[i] = leds[i - 1];
  }

  leds[0] = colors[Math.floor(Math.random() * 3)];

  shots.forEach(s => s.index--);

  shots = shots.filter(s => {
    if (s.index >= 0 && leds[s.index] === s.color) {
      leds[s.index] = "gray";
      score++;
      return false;
    }
    return s.index >= 0;
  });

  io.emit("state", { leds, score, gameState });

}, 200);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Running on port " + PORT);
});
