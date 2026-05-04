import { UI } from "./ui.js";

const socket = io();

/* 🔊 GAME OVER SOUND */
const gameOverSound = new Audio("gameover.mp3");
gameOverSound.volume = 0.7;

/* 🔥 seurataan state-muutosta */
let prevGameState = null;

window.addEventListener("load", () => {

  console.log("DOM READY");

  const startBtn = document.getElementById("startBtn");
  const startGameBtn = document.getElementById("startGameBtn");
  const replayBtn = document.getElementById("replayBtn");
  const startGamePopupBtn = document.getElementById("startGamePopupBtn");

  if (startGamePopupBtn) {
    startGamePopupBtn.addEventListener("click", () => {

      console.log("▶️ START FROM POPUP");

      socket.emit("start");

      UI.startCountdown();
    });
  }

  
  console.log("REPLAY BTN:", replayBtn);

  if (!startBtn) {
    console.error("startBtn NOT FOUND");
    return;
  }

  startBtn.addEventListener("click", () => {
    console.log("START CLICKED");

    UI.animateToLobby();
    socket.emit("resetLobby");
  });

  // 🔥 START GAME
  if (startGameBtn) {
    startGameBtn.addEventListener("click", () => {
      console.log("GAME START CLICKED");
      socket.emit("start");
    });
  }

  // 🔥 REPLAY
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      console.log("🔄 REPLAY CLICKED");

      socket.emit("restartGame");
    });
  }

  /* ================= STATE ================= */

  socket.on("state", (s) => {

    if (!s) return;

    // 🔥 reagoi vain state-muutokseen
    if (s.gameState !== prevGameState) {

      // ▶️ RUNNING
    if (s.gameState === "running") {

    UI.hideGameOver();

    // 🔥 NÄYTÄ POPUP KUN SIIRRYTÄÄN GAMEEN
    if (prevGameState !== "running") {
      UI.showStartPopup();
    }

    if (startGameBtn) {
      startGameBtn.style.display = "none";
    }
  }

      // 💀 GAME OVER
      if (s.gameState === "gameover") {

        console.log("💀 GAME OVER");

        gameOverSound.currentTime = 0;
        gameOverSound.play();

        UI.showGameOver(s.score);
      }
    }

    // 🔥 päivitä state
    prevGameState = s.gameState;

    // 🔥 LOBBY
    if (s.lobby) {
      UI.renderGameId(s.lobby.code);
      UI.renderPlayers(s.lobby.players);
    }

    // 🔥 LEDIT
    if (s.leds) {
      UI.updateLeds(s.leds);
      UI.renderSteps();
    }

    // 🔥 BULLETIT
    if (s.bullets) {
      UI.renderBullets(s.bullets);

      if (s.bullets.length > 0) {
        console.log("🔥 HOST BULLETS:", s.bullets);
      }
    }

    // 🔥 SCORE
    if (typeof s.score !== "undefined") {
      UI.renderScore(s.score);
    }

  });

  /* ================= HIT EFFECT ================= */

  socket.on("hit", (data) => {

    if (!data) return;

    console.log("💥 HIT EVENT:", data);

    UI.showHitEffect(data.index, data.success);
  });

});
