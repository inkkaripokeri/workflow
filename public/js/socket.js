// socket.js

import { UI } from "./ui.js";

const socket = io();

let lobby = null;

// START SCREEN
UI.setStartHandlers(() => {
  socket.emit("resetLobby");
});

// LOBBY FLOW
UI.setLobbyHandlers({
  onContinue: () => {
    // siirry pregameen (server state voi myös ohjata)
  },
  onStartGame: () => {
    socket.emit("start");
  }
});

// RECEIVE STATE
socket.on("state", (state) => {

  lobby = state.lobby;

  // render players always
  UI.renderPlayers(lobby.players);

  const count = Object.values(lobby.players).filter(Boolean).length;

  const btn = document.getElementById("lobbyContinue");

  if (count === 3 && state.gameState === "ready") {
    btn.disabled = false;
    btn.textContent = "CONTINUE";
  } else {
    btn.disabled = true;
    btn.textContent = "WAITING...";
  }

  // AUTO STATE TRANSITIONS
  if (state.gameState === "running") {
    UI.show("game");
  }

  if (state.gameState === "ready") {
    UI.show("pregame");
  }
});
