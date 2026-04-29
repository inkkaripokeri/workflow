const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const LED_COUNT = 50;

let leds = Array(LED_COUNT).fill(null);
let bullets = [];
let score = 0;
let running = false;

let spawnGap = 0;
let lastMove = Date.now();
const moveInterval = 500;

const colors = ["red","green","blue"];
const letters = ["A","B","C"];

function randomColor() {
  return colors[Math.floor(Math.random()*colors.length)];
}

function randomLetter() {
  return letters[Math.floor(Math.random()*letters.length)];
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

  spawnGap = Math.floor(Math.random()*3) + 1;
}

function getFirstBlockingIndex() {
  for (let i = LED_COUNT - 1; i >= 0; i--) {
    if (leds[i] !== null) return i;
  }
  return -1;
}

// 🎮 GAME LOOP (server)
setInterval(() => {

  if (!running) return;

  const now = Date.now();

  // LED move
  if (now - lastMove > moveInterval) {

    if (leds[LED_COUNT - 1] !== null) {
      running = false;
    }

    for (let i = LED_COUNT - 1; i > 0; i--) {
      leds[i] = leds[i - 1];
    }

    spawnTop();
    lastMove = now;
  }

  // bullets move
  bullets.forEach(b => b.y -= 0.5);

  // collision
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

  io.emit("state", { leds, bullets, score, running });

}, 1000/60);

// 👇 SOCKET
io.on("connection", (socket) => {

  socket.on("start", () => {
    leds = Array(LED_COUNT).fill(null);
    bullets = [];
    score = 0;
    running = true;
    lastMove = Date.now();
  });

  socket.on("shoot", ({ color, letter }) => {
    if (!running) return;

    bullets.push({
      y: LED_COUNT - 1,
      color,
      letter
    });
  });

});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
