// ui.js
let movedToGame = false;
let startPopupShown = false;

/* 🔥 MOVING TASKS */
let leds = [];

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

    const target = document.getElementById(screen);

    if (target) {
      target.classList.add("active");
    }

    window.scrollTo(0, 0);
  }

  function animateToLobby() {

    document.body.classList.add("start-to-lobby");

    startPopupShown = false;

    setTimeout(() => {
      show("lobby-screen");
    }, 200);
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

    const count =
      Object.values(players)
        .filter(p => p !== null)
        .length;

    const title =
      document.getElementById("playersTitle");

    if (title) {
      title.textContent =
        `Players Joined ${count}/3`;
    }

    const titleGame =
      document.getElementById("playersTitleGame");

    if (titleGame) {
      titleGame.textContent = "Players";
    }

    const grids = [
      document.getElementById("playersGrid"),
      document.getElementById("playersGridGame")
    ].filter(Boolean);

    if (grids.length === 0) return;

    const roles = [
      {
        key: "designer",
        label: "Designer",
        cls: "designer"
      },
      {
        key: "developer",
        label: "Developer",
        cls: "developer"
      },
      {
        key: "tester",
        label: "Test Engineer",
        cls: "tester"
      }
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

          <img src="${
            r.key === "tester"
              ? "testengineer.png"
              : r.key + ".png"
          }">

          <div class="player-role">
            ${r.label}
          </div>

          <div class="player-name">
            ${name}
          </div>

          <div class="player-status ${statusClass}">
            ${
              statusClass === "waiting"
                ? "WAITING..."
                : statusText
            }
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

  /* ================= TASKS ================= */

  function updateLeds(newLeds) {

    if (!newLeds) return;

    leds = [...newLeds];
  }

  function renderSteps() {

    renderWeekDays();

    const grid =
      document.getElementById("taskGrid");

    const background =
      document.getElementById("taskGridBackground");

    if (!grid || !background) return;

    // 🔥 TAUSTAGRID
    background.innerHTML = "";

    for (let i = 0; i < 14; i++) {

      const bgCell =
        document.createElement("div");

      bgCell.className =
        "grid-background-cell";

      background.appendChild(bgCell);
    }

    // 🔥 TYHJENNÄ VAIN LIIKKUVAT TASKIT
    grid.innerHTML = "";

    // 🔥 MOVING TASKS
    leds.forEach(task => {

      const el =
        document.createElement("div");

      const mysteryClass =
        task.mystery
          ? "task-mystery"
          : "";

      const refinedClass =
        task.refined
          ? "task-refined"
          : "";

      el.className =
        `task-cell moving-task ${mysteryClass} ${refinedClass}`;

      el.innerHTML = `
        <div class="task-text">
          ${task.mystery ? "?" : task.task}
        </div>
      `;

      // 🔥 ROLE COLOR
      el.style.background =
        getRoleColor(task.role);

      // 🔥 SMOOTH POSITION
      const percent =
        (task.x / 13) * 100;

      el.style.left = percent + "%";

      el.style.top = "0";

      grid.appendChild(el);
    });
  }

  /* ================= BULLETS ================= */

  function renderBullets(bullets) {

    const layer =
      document.getElementById("bulletsLayer");

    if (!layer) return;

    layer.innerHTML = "";

    bullets.forEach(b => {

      const el =
        document.createElement("div");

      const mysteryClass =
        b.mystery
          ? "task-mystery"
          : "";

      el.className =
        `task-cell moving-task ${mysteryClass}`;

      el.innerHTML = `
        <div class="task-text">
          ${b.mystery ? "?" : b.task}
        </div>
      `;

      el.style.background =
        getRoleColor(b.role);

      const percent =
        (b.y / 13) * 100;

      el.style.left = percent + "%";

      el.style.top = "0";

      el.style.zIndex = "10";

      layer.appendChild(el);
    });
  }

  /* ================= ROLE COLORS ================= */

  function getRoleColor(role) {

    if (role === "designer") {
      return "#f39c12";
    }

    if (role === "developer") {
      return "#6c5ce7";
    }

    if (role === "tester") {
      return "#00b894";
    }

    return "#ffffff";
  }

  /* ================= SCORE ================= */

  function renderScore(score) {

    const el =
      document.getElementById("scoreValue");

    if (!el) return;

    el.textContent = score ?? 0;
  }

  /* ================= LEVEL ================= */

  function renderLevel(level) {

    const el =
      document.getElementById("levelValue");

    if (!el) return;

    el.textContent = level ?? "Q1";
  }

  /* ================= HIT EFFECT ================= */

  function showHitEffect(index, success) {

    const wrapper =
      document.getElementById("taskGridWrapper");

    if (!wrapper) return;

    if (success) {

      hitSound.currentTime = 0;
      hitSound.play();

    } else {

      failSound.currentTime = 0;
      failSound.play();
    }

    const el =
      document.createElement("div");

    el.className =
      "hit-effect " +
      (success
        ? "hit-success"
        : "hit-fail");

    const percent =
      (index / 13) * 100;

    el.style.left = percent + "%";

    wrapper.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 300);
  }

  /* ================= DAYS ================= */

  function renderWeekDays() {

    const el =
      document.getElementById("weekDays");

    if (!el) return;

    const days = [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ];

    const full = [];

    for (let i = 0; i < 14; i++) {
      full.push(days[i % 7]);
    }

    el.innerHTML = full
      .map(day =>
        `<div class="day-cell">${day}</div>`
      )
      .join("");
  }

  /* ================= GAME OVER ================= */

  function showGameOver(score) {

    const overlay =
      document.getElementById("gameOverOverlay");

    const scoreEl =
      document.getElementById("finalScore");

    if (scoreEl) {
      scoreEl.textContent = score ?? 0;
    }

    if (overlay) {
      overlay.classList.add("active");
    }
  }

  function hideGameOver() {

    const overlay =
      document.getElementById("gameOverOverlay");

    if (overlay) {
      overlay.classList.remove("active");
    }
  }

  /* ================= START POPUP ================= */

  function showStartPopup() {

    const overlay =
      document.getElementById("startOverlay");

    const content =
      document.getElementById("startContent");

    const counter =
      document.getElementById("startCounter");

    if (!overlay) return;

    overlay.classList.add("active");

    if (content) {
      content.style.display = "block";
    }

    if (counter) {
      counter.style.display = "none";
    }
  }

  /* ================= COUNTDOWN ================= */

  function startCountdown(onDone) {

    const content =
      document.getElementById("startContent");

    const counter =
      document.getElementById("startCounter");

    const overlay =
      document.getElementById("startOverlay");

    if (!counter || !overlay) return;

    if (content) {
      content.style.display = "none";
    }

    counter.style.display = "block";

    const steps = [
      "3",
      "2",
      "1",
      "GO!"
    ];

    let i = 0;

    counter.textContent = steps[i];

    const interval = setInterval(() => {

      i++;

      if (i >= steps.length) {

        clearInterval(interval);

        console.log("COUNTDOWN DONE");

        if (typeof onDone === "function") {
          onDone();
        }

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
    renderLevel,
    startCountdown
  };

})();
