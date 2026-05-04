import { UI } from "./ui.js";

const socket = io();

/* 🔊 GAME OVER SOUND */
const gameOverSound = new Audio("gameover.mp3");
gameOverSound.volume = 0.7;

/* 🔥 estetään jatkuva trigger */
let gameOverShown = false;

window.addEventListener("load", () => {

  console.log("DOM READY");

  const startBtn = document.getElementById("startBtn");
  const startGameBtn = document.getElementById("startGameBtn");
  const replayBtn = document.getElementById("replayBtn");

  if (!startBtn) {
    console.error("startBtn NOT FOUND");
    return;
  }

  startBtn.addEventListener("click", () => {
    console.log("START CLICKED");

    UI.animateToLobby();
    socket.emit("resetLobby");

    gameOverShown = false;
  });

  // 🔥 START GAME
  if (startGameBtn) {
    startGameBtn.addEventListener("click", () => {
      console.log("GAME START CLICKED");
      socket.emit("start");

      gameOverShown = false;
    });
  }

  // 🔥 REPLAY NAPPI
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      console.log("🔄 REPLAY CLICKED");

      socket.emit("restartGame");

      // ❌ EI piiloteta täällä enää!
      // UI.hideGameOver();

      gameOverShown = false;
    });
  }

  /* ================= STATE ================= */

  socket.on("state", (s) => {

    if (!s) return;

    // 🔥 kun peli käynnissä → oikea paikka piilottaa popup
    if (s.gameState === "running") {

      gameOverShown = false;

      // ✅ PIILOTUS TÄÄLLÄ (FIX)
      UI.hideGameOver();

      if (startGameBtn) {
        startGameBtn.style.display = "none";
      }
    }

    // 🔥 GAME OVER (vain kerran)
    if (s.gameState === "gameover" && !gameOverShown) {

      console.log("💀 GAME OVER");

      gameOverShown = true;

      gameOverSound.currentTime = 0;
      gameOverSound.play();

      UI.showGameOver(s.score);
    }

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
