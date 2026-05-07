import { UI } from "./ui.js";

const socket = io();

/* 🔊 GAME OVER SOUND */
const gameOverSound = new Audio("gameover.mp3");
gameOverSound.volume = 0.7;

/* 🔥 seurataan state-muutosta */
let prevGameState = null;

/* 🔥 estetään tuplaklikki */
let gameStarting = false;

window.addEventListener("load", () => {

  console.log("DOM READY");

  const startBtn = document.getElementById("startBtn");
  const replayBtn = document.getElementById("replayBtn");
  const startGamePopupBtn = document.getElementById("startGamePopupBtn");

  console.log("REPLAY BTN:", replayBtn);
  console.log("POPUP START BTN:", startGamePopupBtn);

  /* ================= START POPUP ================= */

  if (startGamePopupBtn) {
    startGamePopupBtn.addEventListener("click", () => {

      if (gameStarting) return; // 🔥 estää spam
      gameStarting = true;

      console.log("▶️ START FROM POPUP");

      UI.startCountdown(() => {

        console.log("🚀 EMIT START");

        socket.emit("start");
      });
    });
  }

  /* ================= LOBBY START ================= */

  if (!startBtn) {
    console.error("startBtn NOT FOUND");
    return;
  }

  startBtn.addEventListener("click", () => {
    console.log("START CLICKED");

    UI.animateToLobby();
    socket.emit("resetLobby");

    gameStarting = false; // 🔄 reset
  });

  /* ================= REPLAY ================= */

  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      console.log("🔄 REPLAY CLICKED");

      socket.emit("restartGame");

      gameStarting = false; // 🔄 reset
    });
  }

  /* ================= STATE ================= */

  socket.on("state", (s) => {

    if (!s) return;

    // 🔥 reagoi vain muutoksiin
    if (s.gameState !== prevGameState) {

      console.log("STATE CHANGE:", prevGameState, "→", s.gameState);

      // ▶️ RUNNING
      if (s.gameState === "running") {

        console.log("✅ GAME STARTED");

        UI.hideGameOver();

        gameStarting = false; // 🔄 reset
      }

      // 💀 GAME OVER
      if (s.gameState === "gameover") {

        console.log("💀 GAME OVER");

        gameOverSound.currentTime = 0;
        gameOverSound.play();

        UI.showGameOver(s.score);
      }
    }

    prevGameState = s.gameState;

    /* ================= UI ================= */

    if (s.lobby) {
      UI.renderGameId(s.lobby.code);
      UI.renderPlayers(s.lobby.players);
    }

    if (s.leds) {
      UI.updateLeds(s.leds);
      UI.renderSteps();
    }

    if (s.bullets) {
      UI.renderBullets(s.bullets);
    }

    if (typeof s.score !== "undefined") {
      UI.renderScore(s.score);
    }
    if (s.level) {
      UI.renderLevel(s.level);
    }

  });

  /* ================= HIT ================= */

  socket.on("hit", (data) => {

    if (!data) return;

    console.log("💥 HIT EVENT:", data);

    UI.showHitEffect(data.index, data.success);
  });

});
