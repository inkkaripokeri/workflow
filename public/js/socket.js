import { UI } from "./ui.js";

const socket = io();

window.addEventListener("load", () => {

  console.log("DOM READY");

  const startBtn = document.getElementById("startBtn");
  const lobbyBtn = document.getElementById("lobbyBtn");

  if (!startBtn) {
    console.error("startBtn NOT FOUND");
    return;
  }

  startBtn.addEventListener("click", () => {
    console.log("START CLICKED");

    UI.animateToLobby();
    socket.emit("resetLobby");
  });

  if (lobbyBtn) {
    lobbyBtn.addEventListener("click", () => {
      console.log("CONTINUE CLICKED");
    });
  }

  socket.on("state", (s) => {

    if (!s || !s.lobby) return;

    UI.renderGameId(s.lobby.code);
    UI.renderPlayers(s.lobby.players);

    const p = s.lobby.players;

    const ready = p.designer && p.developer && p.tester;

    const btn = document.getElementById("lobbyBtn");
    if (btn) btn.disabled = !ready;
  });

});
