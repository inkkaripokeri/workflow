// ui.js

export const UI = (() => {

  const screens = {
    start: document.getElementById("start-screen"),
    lobby: document.getElementById("lobby-screen"),
    pregame: document.getElementById("pre-game"),
    game: document.getElementById("game-screen"),
  };

  function show(screenName) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screens[screenName].classList.add("active");
  }

  function setStartHandlers(onStart) {
    document.getElementById("startContinue").onclick = () => {
      show("lobby");
      onStart?.();
    };
  }

  function setLobbyHandlers({ onContinue, onStartGame }) {
    document.getElementById("lobbyContinue").onclick = () => {
      show("pregame");
      onContinue?.();
    };

    document.getElementById("startGameBtn").onclick = () => {
      show("game");
      onStartGame?.();
    };
  }

  function renderPlayers(players) {
    const el = document.getElementById("players");

    const map = [
      { key: "designer", label: "Designer", img: "designer.png" },
      { key: "developer", label: "Developer", img: "developer.png" },
      { key: "tester", label: "Test Engineer", img: "testengineer.png" }
    ];

    el.innerHTML = map.map(p => {

      const data = players?.[p.key];

      const isConnected = !!data;

      return `
        <div class="player">
          <div class="player-card">
            <img src="${p.img}">
            
            <img class="status-icon"
              src="${isConnected ? "Connected_icon.png" : "Disconnected_Icon.png"}"
            >
          </div>

          <div class="player-name">${p.label}</div>

          <div class="player-status">
            ${isConnected ? data.name : "Waiting"}
            <span class="dots">.</span>
          </div>
        </div>
      `;
    }).join("");
  }

  // simple dot animation
  setInterval(() => {
    document.querySelectorAll(".dots").forEach(d => {
      const current = d.textContent;
      d.textContent = current.length >= 3 ? "." : current + ".";
    });
  }, 500);

  return {
    show,
    setStartHandlers,
    setLobbyHandlers,
    renderPlayers
  };

})();
