// ui.js

export const UI = (() => {

  function show(screenName) {
    document.querySelectorAll(".screen").forEach(s => {
      s.style.display = "none";
    });

    const el = document.getElementById(screenName + "-screen");
    if (el) {
      el.style.display = (screenName === "start") ? "flex" : "block";
    }
  }

  function setStartHandlers(onStart) {
    const btn = document.getElementById("startContinue");

    if (!btn) {
      console.error("startContinue button NOT FOUND");
      return;
    }

    btn.addEventListener("click", () => {
      console.log("START BUTTON CLICKED (UI)");
      show("lobby");
      if (onStart) onStart();
    });
  }

  function setLobbyHandlers({ onContinue, onStartGame }) {

    const continueBtn = document.getElementById("lobbyContinue");
    const startBtn = document.getElementById("startGameBtn");

    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        console.log("CONTINUE CLICKED (UI)");
        show("pregame");
        onContinue?.();
      });
    }

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        console.log("START GAME CLICKED (UI)");
        show("game");
        onStartGame?.();
      });
    }
  }

  function renderPlayers(players) {
    const el = document.getElementById("players");
    if (!el) return;

    const roles = [
      { key: "designer", label: "Designer", img: "designer.png" },
      { key: "developer", label: "Developer", img: "developer.png" },
      { key: "tester", label: "Test Engineer", img: "testengineer.png" }
    ];

    el.innerHTML = roles.map(r => {
      const p = players?.[r.key];

      return `
        <div class="player">
          <img src="${r.img}">
          <div>${r.label}</div>
          <div>${p ? p.name : "Waiting..."}</div>
        </div>
      `;
    }).join("");
  }

  return {
    show,
    setStartHandlers,
    setLobbyHandlers,
    renderPlayers
  };

})();
