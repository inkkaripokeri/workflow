// ui.js
let movedToGame = false;
let startPopupShown = false;

/* 🔥 GAME LEDS (näytetään vain alkuosa) */
let leds = Array(14).fill(null);

const hitSound = new Audio("hit.mp3");
const failSound = new Audio("fail.mp3");

hitSound.volume = 0.6;
failSound.volume = 0.6;

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

    startPopupShown = false;
    
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
      titleGame.textContent = "Players";
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

        if (!startPopupShown) {
          showStartPopup();
          startPopupShown = true;
        }

      }, 800);
    }
  }

  /* ================= LEDS ================= */

  function updateLeds(newLeds) {
    if (!newLeds) return;
    leds = newLeds.slice(0, 14);
  }

  function renderSteps() {

    renderWeekDays();

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

      el.className = `task-cell`;
      el.innerHTML = `<div class="task-text">${b.task}</div>`;
      el.style.background = getRoleColor(b.role);

      const percent = (b.y / 13) * 100;
      el.style.left = percent + "%";

      el.style.position = "absolute";
      el.style.top = "0";

      layer.appendChild(el);
    });
  }

  function getRoleColor(role) {
    if (role === "designer") return "#f39c12";
    if (role === "developer") return "#6c5ce7";
    if (role === "tester") return "#00b894";
    return "#fff";
  }

  /* ================= SCORE ================= */

  function renderScore(score) {
    const el = document.getElementById("scoreValue");
    if (!el) return;

    el.textContent = score ?? 0;
  }

  /* ================= HIT EFFECT ================= */

  function showHitEffect(index, success) {

    const wrapper = document.getElementById("taskGridWrapper");
    if (!wrapper) return;

    if (success) {
      hitSound.currentTime = 0;
      hitSound.play();
    } else {
      failSound.currentTime = 0;
      failSound.play();
    }

    const el = document.createElement("div");

    el.className = "hit-effect " + (success ? "hit-success" : "hit-fail");

    const percent = (index / 13) * 100;
    el.style.left = percent + "%";

    wrapper.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 300);
  }

  /* ======= DAYS ====== */

  function renderWeekDays() {

    const el = document.getElementById("weekDays");
    if (!el) return;

    const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

    const full = [];

    for (let i = 0; i < 14; i++) {
      full.push(days[i % 7]);
    }

    el.innerHTML = full
      .map(d => `<div class="day-cell">${d}</div>`)
      .join("");
  }

  /* ================= GAME OVER ================= */

  function showGameOver(score) {

    const overlay = document.getElementById("gameOverOverlay");
    const scoreEl = document.getElementById("finalScore");

    if (scoreEl) {
      scoreEl.textContent = score ?? 0;
    }

    if (overlay) {
      overlay.classList.add("active");
    }
  }

  function hideGameOver() {
    const overlay = document.getElementById("gameOverOverlay");
    if (overlay) {
      overlay.classList.remove("active");
    }
  }

  /* ========== SHOW START POPUP ============ */

  function showStartPopup() {
    const overlay = document.getElementById("startOverlay");
    const content = document.getElementById("startContent");
    const counter = document.getElementById("startCounter");

    if (!overlay) return;

    overlay.classList.add("active");

    if (content) content.style.display = "block";
    if (counter) counter.style.display = "none";
  }
  
  /* ========== COUNTDOWN START (🔥 KORJATTU) ============ */

  function startCountdown(onDone) {

    const content = document.getElementById("startContent");
    const counter = document.getElementById("startCounter");
    const overlay = document.getElementById("startOverlay");

    if (!counter || !overlay) return;

    if (content) content.style.display = "none";
    counter.style.display = "block";

    let steps = ["3", "2", "1", "GO!"];
    let i = 0;

    counter.textContent = steps[i];

    const interval = setInterval(() => {
      i++;

      if (i >= steps.length) {
        clearInterval(interval);

        // 🔥 KÄYNNISTÄ PELI TÄSSÄ
        if (onDone) onDone();

        setTimeout(() => {
          overlay.classList.remove("active");
        }, 400);

        return;
      }

      counter.textContent = steps[i];

    }, 700);
  }

  return {
    show,
    animateToLobby,
    renderGameId,
    renderPlayers,
    renderSteps,
    updateLeds,
    renderBullets,
    renderScore,
    showHitEffect,
    showGameOver,
    hideGameOver,
    showStartPopup,
    startCountdown
  };

})();
