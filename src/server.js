import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import path from "path";

const __dirname = path.resolve();
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");
app.use("/public", express.static(__dirname + "/src/public"));
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/*", (req, res) => {
  res.redirect("/");
});

const portNum = 3000;
const handleListen = () =>
  console.log(`Listening no http://localhost:${portNum}}`);

const server = http.createServer(app);
//server 에 접근
const wss = new WebSocketServer({ server });

function onSocketClose() {
  console.log("Disconnected from Browser ❌");
}

function onSocketMessage(message) {
  console.log("Browser said :", message);
}

wss.on("connection", (socket) => {
  console.log("Connected to Browser ✅");
  socket.on("close", onSocketClose);
  socket.on("message", onSocketMessage);
  socket.send("hello!");
});

server.listen(3000, handleListen);
