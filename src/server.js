import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";
import path from "path";

const __dirname = path.resolve();
const app = express();
const portNum = 3000;

// app.set("view engine", "pug");
// app.set("views", __dirname + "/src/views");
// app.use("/public", express.static(__dirname + "/src/public"));

app.use(express.static(path.join(__dirname, "client", "dist")));
app.get("/", (req, res) => {
  // res.render("home");
  // res.sendFile(path.join(__dirname, "dist", "index.html"));
  res.redirect("https://web-client-luj2cle9ghnxl.sel3.cloudtype.app");
});
app.get("/*", (req, res) => {
  res.redirect("/");
});

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

const handleListen = () =>
  console.log(`Listening no http://localhost:${portNum}}`);
httpServer.listen(portNum, handleListen);
