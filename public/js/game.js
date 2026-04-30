document.getElementById("continueBtn").onclick = () => {
  socket.emit("start");
};
