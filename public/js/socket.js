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

  socket.on("state", (s) => {
  
    if (!s) return;
  
    if (s.lobby) {
      UI.renderGameId(s.lobby.code);
      UI.renderPlayers(s.lobby.players);
    }
  
    // 🔥 LEDIT
    if (s.leds) {
      UI.updateLeds(s.leds);
      UI.renderSteps();
    }

    // 🔥 UUSI: BULLETIT
    if (s.bullets) {
      UI.renderBullets(s.bullets);
    }
  
  });

});
