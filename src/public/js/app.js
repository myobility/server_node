const socket = new WebSocket(`ws://${window.location.host}`);

function handleOpne() {
  console.log("Connected to Server ✅");
}
function handleClose() {
  console.log("Disconnection from Server ❌");
}
function handleMessage(message) {
  console.log(`Server said: ${message.data}`);
}

socket.addEventListener("open", handleOpne);
socket.addEventListener("message", handleMessage);
socket.addEventListener("close", handleClose);

setTimeout(() => {
  socket.send("Hello from the brower");
}, 1000);
