import http from "http";
import { Server } from "socket.io";
import express from "express";
import path from "path";

const __dirname = path.resolve();
const app = express();
const portNum = 3000;

// app.set("view engine", "pug");
// app.set("views", __dirname + "/src/views");
// app.use("/public", express.static(__dirname + "/src/public"));

const waitingList = [];

app.use(express.static(path.join(__dirname, "client", "dist")));
app.get("/", (req, res) => {
  // res.render("home");
  res.sendFile(path.join(__dirname, "dist", "index.html"));
  // res.redirect("https://web-client-luj2cle9ghnxl.sel3.cloudtype.app");
  // res.redirect("http://localhost:5173/");
});
app.get("/*", (req, res) => {
  res.redirect("/");
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    // origin: "*",
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("matching", (uid, location) => {
    waitingList.push({ uid: uid, socketId: socket.id, location: location });
    socket.emit(
      "matching",
      `매칭하고 있습니다, 당신의 socket.id: ${socket.id}`
    );
    // matchingUser(uid, location);
    socket.emit("matched", matchingUser(uid, location));
    console.log(waitingList);
  });

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

const matchingUser = (_uid, _location) => {
  console.log("matchingUser");
  const userList = waitingList.filter(
    (item) => getDistance(item.location, _location) <= 5 && item.uid !== _uid
  );
  return userList[parseInt((Math.random() * (userList.length - 1)).toFixed())]
    .uid;
};

const getDistance = (loc1, loc2) => {
  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };
  const R = 6371;
  const dLat = deg2rad(loc2.latitude - loc1.latitude);
  const dLon = deg2rad(loc2.longitude - loc1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(loc1.latitude)) *
      Math.cos(deg2rad(loc2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
