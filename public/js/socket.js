const socket = io();

document.getElementById("startBtn").onclick = () => {
  setState("lobby");
  socket.emit("resetLobby");
};

socket.on("state", (s) => {

  state.lobby = s.lobby;

  if (state.screen === "lobby") {
    renderPlayers(s.lobby.players);

    const count = Object.values(s.lobby.players).filter(Boolean).length;
    document.getElementById("continueBtn").disabled = count !== 3;
  }

  if (s.gameState === "running") {
    setState("game");
  }
});
