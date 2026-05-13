const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const LED_COUNT = 14;

// 🔥 BACKLOG REFINEMENT POSITION
const REFINEMENT_POSITION = 8;

// 🔥 GAME SPEED
let taskSpeed = 0.015;

let tasks, bullets, score, running, spawnGap;
let pendingGameOver = false;

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

// 🔥 TASKS BY ROLE
const TASKS_BY_ROLE = {
  designer: TASKS.filter(t => t.role === "designer"),
  developer: TASKS.filter(t => t.role === "developer"),
  tester: TASKS.filter(t => t.role === "tester")
};

function randomTask() {
  return TASKS[Math.floor(Math.random() * TASKS.length)];
}

// 🔥 BACKLOG REFINEMENT
function refineTask(taskObj) {

  const roleTasks = TASKS_BY_ROLE[taskObj.role];

  if (!roleTasks || roleTasks.length <= 1) return;

  let newTask =
    roleTasks[
      Math.floor(Math.random() * roleTasks.length)
    ];

  while (newTask.task === taskObj.task) {

    newTask =
      roleTasks[
        Math.floor(Math.random() * roleTasks.length)
      ];
  }

  taskObj.task = newTask.task;
  taskObj.color = newTask.color;
  taskObj.refined = true;

  console.log(
    "🔴 REFINED:",
    taskObj.role,
    "->",
    taskObj.task
  );
}

let lobby = {};
let gameState = "waiting";

/* 🔥 LEVEL SPEED */
function updateLevelSpeed() {

  if (score >= 40) {
    taskSpeed = 0.05; // Q5
  } else if (score >= 30) {
    taskSpeed = 0.04; // Q4
  } else if (score >= 20) {
    taskSpeed = 0.03; // Q3
  } else if (score >= 10) {
    taskSpeed = 0.022; // Q2
  } else {
    taskSpeed = 0.015; // Q1
  }
}

function getLevel() {
  if (score >= 40) return "Q5";
  if (score >= 30) return "Q4";
  if (score >= 20) return "Q3";
  if (score >= 10) return "Q2";
  return "Q1";
}

function newLobby() {

  lobby = {
    code: Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0"),

    players: {
      designer: null,
      developer: null,
      tester: null
    }
  };

  gameState = "waiting";
}

function resetGame() {

  tasks = [];
  bullets = [];

  score = 0;

  running = false;

  spawnGap = 0;

  pendingGameOver = false;

  taskSpeed = 0.015;
}

newLobby();
resetGame();

// 🔥 SPAWN TASK
function spawnTask() {

  if (spawnGap > 0) {
    spawnGap--;
    return;
  }

  const t = randomTask();

  const isMystery = Math.random() < 0.05;

  tasks.push({

    x: 0,

    role: t.role,
    color: t.color,
    task: t.task,

    mystery: isMystery,

    refined: false
  });

  spawnGap = Math.floor(Math.random() * 3) + 1;
}

setInterval(() => {

  if (!running) {

    io.emit("state", {
      leds: tasks,
      bullets,
      score,
      level: getLevel(),
      running,
      lobby,
      gameState
    });

    return;
  }

  // 🔥 SPAWN
  if (Math.random() < 0.015) {
    spawnTask();
  }

  // 🔥 MOVE TASKS
  tasks.forEach(task => {
    task.x += taskSpeed;
  });

  // 🔥 BACKLOG REFINEMENT
  tasks.forEach(task => {

    if (
      !task.refined &&
      task.x >= REFINEMENT_POSITION
    ) {
      refineTask(task);
    }

  });

  // 🔥 GAME OVER
  tasks.forEach(task => {

    if (task.x >= LED_COUNT - 1) {
      pendingGameOver = true;
    }

  });

  if (pendingGameOver) {

    running = false;
    gameState = "gameover";
    pendingGameOver = false;
  }

  // 🔥 BULLET MOVEMENT
  bullets.forEach(b => {
    b.y -= 0.5;
  });

  bullets = bullets.filter(b => {

    // 🔥 FIND COLLISION TASK
    const hitTask = tasks.find(task =>
      Math.abs(task.x - b.y) < 0.4
    );

    if (!hitTask) {
      return b.y >= 0;
    }

    console.log(
      "🎯 TARGET:",
      hitTask.role,
      hitTask.task,
      "| mystery:",
      hitTask.mystery
    );

    console.log(
      "💥 SHOT:",
      b.role,
      b.task
    );

    // 🔥 OIKEA ROLE + OIKEA TASK
    if (
      hitTask.role === b.role &&
      hitTask.task === b.task
    ) {

      tasks = tasks.filter(t => t !== hitTask);

      score++;

      updateLevelSpeed();

      io.emit("hit", {
        index: Math.floor(hitTask.x),
        success: true
      });

    } else {

      score = Math.max(0, score - 1);

      updateLevelSpeed();

      io.emit("hit", {
        index: Math.floor(hitTask.x),
        success: false
      });
    }

    return false;
  });

  io.emit("state", {
    leds: tasks,
    bullets,
    score,
    level: getLevel(),
    running,
    lobby,
    gameState
  });

}, 1000 / 60);

io.on("connection", (socket) => {

  // 🔥 AUTO RESET
  if (!running && gameState === "gameover") {

    console.log("🧼 AUTO RESET AFTER GAMEOVER");

    newLobby();
    resetGame();
  }

  // 🔥 RESET LOBBY
  socket.on("resetLobby", () => {

    console.log("🔄 RESET LOBBY");

    newLobby();
    resetGame();
  });

  socket.on("join", ({ code, role, name }) => {

    if (!ROLES.includes(role)) return;
    if (code !== lobby.code) return;
    if (lobby.players[role]) return;

    lobby.players[role] = {
      id: socket.id,
      name
    };

    socket.data.role = role;
    socket.data.code = code;

    const count =
      Object.values(lobby.players)
        .filter(Boolean)
        .length;

    if (count === 3) {
      gameState = "ready";
    }

    socket.emit("joinResult", {
      ok: true
    });
  });

  socket.on("start", () => {

    console.log("🔥 START RECEIVED");

    const count =
      Object.values(lobby.players)
        .filter(Boolean)
        .length;

    if (count === 3) {

      resetGame();

      running = true;
      gameState = "running";
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

    const count =
      Object.values(lobby.players)
        .filter(Boolean)
        .length;

    if (count === 3) {

      console.log("🔄 RESTART GAME");

      resetGame();

      running = true;
      gameState = "running";
      pendingGameOver = false;
    }
  });

  socket.on("disconnect", () => {

    const role = socket.data.role;

    if (
      role &&
      lobby.players[role]?.id === socket.id
    ) {
      lobby.players[role] = null;
    }
  });

});

server.listen(3000, () =>
  console.log("Server running")
);
