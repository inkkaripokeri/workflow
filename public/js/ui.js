function renderPlayers(players) {

  const el = document.getElementById("playersGrid");

  const roles = [
    { key: "designer", label: "Designer", cls: "designer" },
    { key: "developer", label: "Developer", cls: "developer" },
    { key: "tester", label: "Test Engineer", cls: "tester" }
  ];

  el.innerHTML = roles.map(r => {

    const p = players[r.key];

    let statusText = "WAITING";
    let statusClass = "waiting";
    let icon = "";
    let name = "";

    if (p) {
      name = p.name;

      if (p.connected === false) {
        statusText = "DISCONNECTED";
        statusClass = "disconnected";
        icon = `<img class="status-icon" src="Disconnected_Icon.png">`;
      } else {
        statusText = "CONNECTED";
        statusClass = "connected";
        icon = `<img class="status-icon" src="Connected_icon.png">`;
      }
    }

    return `
      <div class="player ${r.cls}">
        ${icon}

        <img src="${r.key === "tester" ? "testengineer.png" : r.key + ".png"}">

        <div class="player-role">${r.label}</div>
        <div class="player-name">${name}</div>
        <div class="player-status ${statusClass}">
          ${statusText}<span class="dots">.</span>
        </div>
      </div>
    `;
  }).join("");
}
