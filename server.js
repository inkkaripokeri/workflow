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
const colors = ["red","green","blue"];
const letters = ["A","B","C"];

let lobby = {};

function newLobby() {
  lobby = {
    code: Math.floor(1000 + Math.random()*9000).toString(),
    players: { red:null, green:null, blue:null }
  };
}
newLobby();

function resetGame() {
  leds = Array(LED_COUNT).fill(null);
  bullets = [];
  score = 0;
  running = false;
  spawnGap = 0;
}
resetGame();

function randomColor() {
  return colors[Math.floor(Math.random()*3)];
}
function randomLetter() {
  return letters[Math.floor(Math.random()*3)];
}

function spawnTop() {
  if (spawnGap > 0) {
    leds[0] = null;
    spawnGap--;
    return;
  }
  leds[0] = { color: randomColor(), letter: randomLetter() };
  spawnGap = Math.floor(Math.random()*3)+1;
}

function getFirstBlockingIndex() {
  for (let i=LED_COUNT-1;i>=0;i--) {
    if (leds[i]) return i;
  }
  return -1;
}

// 🎮 GAME LOOP
setInterval(()=>{

  if (!running) {
    io.emit("state", { leds, bullets, score, running, lobby });
    return;
  }

  const now = Date.now();

  if (now - lastMove > moveInterval) {

    if (leds[LED_COUNT-1]) {
      running = false;
    }

    for (let i=LED_COUNT-1;i>0;i--) {
      leds[i] = leds[i-1];
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

  io.emit("state", { leds, bullets, score, running, lobby });

}, 1000/60);

// 🔌 SOCKET
io.on("connection", (socket)=>{

  socket.on("resetLobby", ()=>{
    newLobby();
    resetGame();
  });

  socket.on("join", ({ code, color }) => {

    if (code !== lobby.code) {
      socket.emit("joinResult", { ok:false, msg:"Wrong code" });
      return;
    }

    if (lobby.players[color]) {
      socket.emit("joinResult", { ok:false, msg:"Taken" });
      return;
    }

    lobby.players[color] = socket.id;
    socket.data.color = color;

    socket.emit("joinResult", { ok:true });
  });

  socket.on("start", ()=>{
    const count = Object.values(lobby.players).filter(Boolean).length;
    if (count === 3) {
      running = true;
      lastMove = Date.now();
    }
  });

  socket.on("shoot", ({ color, letter })=>{
    if (!running) return;

    bullets.push({ y: LED_COUNT-1, color, letter });
  });

  socket.on("disconnect", ()=>{
    const c = socket.data.color;
    if (c && lobby.players[c] === socket.id) {
      lobby.players[c] = null;
    }
  });

});

server.listen(3000, ()=>console.log("Server running"));
