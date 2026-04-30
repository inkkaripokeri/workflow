import { UI } from "./ui.js";

const socket = io();

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("startBtn").onclick = () => {
    UI.animateToLobby();
    socket.emit("resetLobby");
  };

  document.getElementById("lobbyBtn").onclick = () => {
    console.log("continue...");
  };

  socket.on("state", (s) => {

    if (!s || !s.lobby) return;

    UI.renderGameId(s.lobby.code);
    UI.renderPlayers(s.lobby.players);

    const p = s.lobby.players;

    const ready = p.designer && p.developer && p.tester;

    document.getElementById("lobbyBtn").disabled = !ready;
  });

});
