import { UI } from "./ui.js";

const socket = io();

window.addEventListener("load", () => {

  console.log("DOM READY");

  const startBtn = document.getElementById("startBtn");

  if (!startBtn) {
    console.error("startBtn NOT FOUND");
    return;
  }

  startBtn.addEventListener("click", () => {
    console.log("START CLICKED");

    UI.animateToLobby();
    socket.emit("resetLobby");
  });

  socket.on("state", (s) => {

    if (!s || !s.lobby) return;

    UI.renderGameId(s.lobby.code);
    UI.renderPlayers(s.lobby.players);

  });

});
