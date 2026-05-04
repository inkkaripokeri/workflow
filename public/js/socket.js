import { UI } from "./ui.js";

const socket = io();

window.addEventListener("load", () => {

  console.log("DOM READY");

  const startBtn = document.getElementById("startBtn");
  const startGameBtn = document.getElementById("startGameBtn");

  if (!startBtn) {
    console.error("startBtn NOT FOUND");
    return;
  }

  startBtn.addEventListener("click", () => {
    console.log("START CLICKED");

    UI.animateToLobby();
    socket.emit("resetLobby");
  });

  // 🔥 START GAME NAPPI
  if (startGameBtn) {
    startGameBtn.addEventListener("click", () => {
      console.log("GAME START CLICKED");
      socket.emit("start");
    });
  }

  /* ================= STATE ================= */

  socket.on("state", (s) => {

    if (!s) return;

    // 🔥 PIILOTA START NAPPI KUN PELI ALKAA
    if (s.gameState === "running") {
      if (startGameBtn) {
        startGameBtn.style.display = "none";
      }
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
