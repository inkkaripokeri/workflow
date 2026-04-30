const AppState = {
  START: "start",
  LOBBY: "lobby",
  GAME: "game"
};

let state = {
  screen: AppState.START,
  lobby: null
};

function setState(next) {
  state.screen = next;
  render();
}
