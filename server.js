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

const colors = ["red","green","blue"];

io.on("connection", (socket) => {
  socket.on("shoot", (color) => {
    shots.push({ index: ledCount - 1, color });
  });
});

setInterval(() => {

  if (leds[ledCount - 1] !== "gray") {
    leds = Array(ledCount).fill("gray");
    shots = [];
    score = 0;
  }

  for (let i = ledCount - 1; i > 0; i--) {
    leds[i] = leds[i - 1];
  }

  leds[0] = colors[Math.floor(Math.random()*3)];

  shots.forEach(s => s.index--);

  shots = shots.filter(s => {
    if (s.index >= 0 && leds[s.index] === s.color) {
      leds[s.index] = "gray";
      score++;
      return false;
    }
    return s.index >= 0;
  });

  io.emit("state", { leds, score });

}, 200);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Running on port " + PORT);
});
