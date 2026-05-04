// ui.js
let movedToGame = false;

/* 🔥 GAME LEDS (näytetään vain alkuosa) */
let leds = Array(14).fill(null);

export const UI = (() => {

  /* ================= SCREEN ================= */
  function show(screen) {
    document.querySelectorAll(".screen").forEach(s =>
      s.classList.remove("active")
    );

    document.getElementById(screen).classList.add("active");

    window.scrollTo(0, 0);
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

    const count = Object.values(players).filter(p => p !== null).length;
    
    const title = document.getElementById("playersTitle");
    if (title) {
      title.textContent = `Players Joined ${count}/3`;
    }

    const titleGame = document.getElementById("playersTitleGame");
    if (titleGame) {
      titleGame.textContent = `Players Joined ${count}/3`;
    }

    const grids = [
      document.getElementById("playersGrid"),
      document.getElementById("playersGridGame")
    ].filter(Boolean);

    if (grids.length === 0) return;

    const roles = [
      { key: "designer", label: "Designer", cls: "designer" },
      { key: "developer", label: "Developer", cls: "developer" },
      { key: "tester", label: "Test Engineer", cls: "tester" }
    ];

    const html = roles.map(r => {

      const p = players[r.key];

      let statusText = "Waiting";
      let statusClass = "waiting";
      let name = "";

      if (p) {
        name = p.name;

        if (p.connected === false) {
          statusText = "DISCONNECTED";
          statusClass = "disconnected";
        } else {
          statusText = "CONNECTED";
          statusClass = "connected";
        }
      }

      return `
        <div class="player ${r.cls}">
          <img src="${r.key === "tester" ? "testengineer.png" : r.key + ".png"}">
          <div class="player-role">${r.label}</div>
          <div class="player-name">${name}</div>
          <div class="player-status ${statusClass}">
            ${statusClass === "waiting" ? "WAITING..." : statusText}
          </div>
        </div>
      `;
    }).join("");

    grids.forEach(el => {
      el.innerHTML = html;
    });

    if (count === 3 && !movedToGame) {
      movedToGame = true;

      setTimeout(() => {
        show("game-screen");
      }, 800);
    }
  }

  /* ================= LEDS ================= */

  function updateLeds(newLeds) {
    if (!newLeds) return;

    leds = newLeds.slice(0, 14);
  }

  function renderSteps() {
    const grid = document.getElementById("taskGrid");
    if (!grid) return;

    grid.innerHTML = leds.map(l => {
      if (!l) return `<div class="task-cell"></div>`;
      return `
        <div class="task-cell" style="background:${l.color}">
          <div class="task-text">${l.task}</div>
        </div>
      `;
    }).join("");
  }

  /* ================= BULLETS ================= */

  function renderBullets(bullets) {
    const layer = document.getElementById("bulletsLayer");
    if (!layer) return;

    layer.innerHTML = "";

    bullets.forEach(b => {

      const el = document.createElement("div");
      el.className = "bullet";

      // 🔥 väri roolin mukaan
      if (b.role === "designer") el.style.background = "#f39c12";
      if (b.role === "developer") el.style.background = "#6c5ce7";
      if (b.role === "tester") el.style.background = "#00b894";

      // 🔥 sijainti (14 = LED_COUNT)
      const percent = (b.x / 14) * 100;
      el.style.left = percent + "%";

      layer.appendChild(el);
    });
  }

  /* ================= WAITING ANIMATION ================= */

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
    renderPlayers,
    renderSteps,
    updateLeds,
    renderBullets // 🔥 uusi export
  };

})();
