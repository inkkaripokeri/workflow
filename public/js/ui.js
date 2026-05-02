// ui.js

export const UI = (() => {

  /* ================= SCREEN ================= */
  function show(screen) {
    document.querySelectorAll(".screen").forEach(s =>
      s.classList.remove("active")
    );
    document.getElementById(screen).classList.add("active");
  }

  function animateToLobby() {
    document.body.classList.add("start-to-lobby");
    setTimeout(() => show("lobby-screen"), 200);
  }

  /* ================= GAME ID ================= */
  function renderGameId(code) {
    if (!code) return;

    const el = document.getElementById("gameId");
    if (!el) return;

    el.innerHTML = code
      .split("")
      .map(d => `<div class="digit">${d}</div>`)
      .join("");
  }

/* ================= PLAYERS ================= */
function renderPlayers(players) {

  // 🔥 laske montako pelaajaa liittynyt
  const count = Object.values(players).filter(p => p !== null).length;
  
  // 🔥 päivitä otsikko
  const title = document.getElementById("playersTitle");
  if (title) {
    title.textContent = `Players Joined ${count}/3`;
  }
  
  const el = document.getElementById("playersGrid");
  if (!el) return;

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
          ${statusClass === "waiting" ? "WAITING..." : statusText}
        </div>
      </div>
    `;
  }).join("");
}
  
  /* ================= WAITING ANIMATION (STABLE) ================= */

  const dotStates = new Map();

  setInterval(() => {
    document.querySelectorAll(".player-status.waiting .dots")
      .forEach(el => {

        let count = dotStates.get(el) || 1;
        count = count >= 3 ? 1 : count + 1;

        dotStates.set(el, count);
        el.textContent = ".".repeat(count);
      });
  }, 500);

  return {
    show,
    animateToLobby,
    renderGameId,
    renderPlayers
  };

})();
