// socket.js

import { UI } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {

  const socket = io();

  let lobby = null;

  console.log("socket.js loaded");

  // =========================
  // START SCREEN
  // =========================
  UI.setStartHandlers(() => {
    console.log("START CLICKED");
    socket.emit("resetLobby");
  });

  // =========================
  // LOBBY FLOW
  // =========================
  UI.setLobbyHandlers({
    onContinue: () => {
      console.log("CONTINUE CLICKED");
      // siirtyminen hoidetaan UI:ssa
    },
    onStartGame: () => {
      console.log("START GAME CLICKED");
      socket.emit("start");
    }
  });

  // =========================
  // RECEIVE STATE
  // =========================
  socket.on("state", (state) => {

    if (!state || !state.lobby) return;

    lobby = state.lobby;

    // render players
    UI.renderPlayers(lobby.players);

    const count = Object.values(lobby.players || {}).filter(Boolean).length;

    const btn = document.getElementById("lobbyContinue");

    if (btn) {
      if (count === 3 && state.gameState === "ready") {
        btn.disabled = false;
        btn.textContent = "CONTINUE";
      } else {
        btn.disabled = true;
        btn.textContent = "WAITING...";
      }
    }

    // =========================
    // AUTO STATE TRANSITIONS
    // =========================
    if (state.gameState === "running") {
      UI.show("game");
    } 
    else if (state.gameState === "ready") {
      UI.show("pregame");
    }

  });

});
