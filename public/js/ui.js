export const UI = (() => {

  function show(screen) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screen).classList.add("active");
  }

  function animateToLobby() {
    document.body.classList.add("start-to-lobby");
    setTimeout(() => show("lobby-screen"), 200);
  }

  function renderGameId(code) {
    document.getElementById("gameId").textContent =
      code.split("").join(" ");
  }

  function renderPlayers(players) {

    const el = document.getElementById("playersGrid");

    el.innerHTML = ["designer","developer","tester"].map(role => {

      const p = players[role];

      let status = "WAITING...";
      let icon = "";

      if (p) {
        if (p.connected === false) {
          status = "DISCONNECTED";
          icon = `<img src="Disconnected_Icon.png" width="16">`;
        } else {
          status = "CONNECTED";
          icon = `<img src="Connected_icon.png" width="16">`;
        }
      }

      return `
        <div class="player">
          <img src="${role === "tester" ? "testengineer.png" : role + ".png"}">
          <div>${role}</div>
          <div>${p ? p.name : ""}</div>
          <div class="status">${icon} ${status}</div>
        </div>
      `;
    }).join("");
  }

  return { show, animateToLobby, renderPlayers, renderGameId };

})();
