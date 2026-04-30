function render() {

  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));

  if (state.screen === "start") {
    document.getElementById("start").classList.add("active");
  }

  if (state.screen === "lobby") {
    document.getElementById("lobby").classList.add("active");
  }

  if (state.screen === "game") {
    document.getElementById("game").classList.add("active");
  }
}

function renderPlayers(players) {
  document.getElementById("players").innerHTML =
    Object.entries(players).map(([k,v]) =>
      `<div>${k}: ${v?.name || "waiting..."}</div>`
    ).join("");
}
