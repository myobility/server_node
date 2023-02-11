import http from "http";
import { Server } from "socket.io";
import express from "express";
import path, { parse } from "path";

const __dirname = path.resolve();
const app = express();
const portNum = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");
app.use("/public", express.static(__dirname + "/src/public"));
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/*", (req, res) => {
  res.redirect("/");
});

const handleListen = () =>
  console.log(`Listening no http://localhost:${portNum}}`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

wsServer.on("connection", (socket) => {
  socket.on("enter_room", (roomName, done) => {
    console.log(roomName);
    setTimeout(() => {
      done();
    }, 10000);
  });
});

httpServer.listen(3000, handleListen);
