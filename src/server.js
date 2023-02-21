import http from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";

const app = express();
const portNum = 3000;

let waitingList = [];

// app.use(cors());
// app.get("/", cors(), (req, res) => {
//   // res.redirect("https://web-client-luj2cle9ghnxl.sel3.cloudtype.app");
//   // res.redirect("http://localhost:5173/");
//   // res.redirect("/");
// });
app.get("/", cors(), (req, res) => {
  res.send("cors!");
});
app.get("/*", (req, res) => {
  res.redirect("/");
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    // origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("matching", (uid, location) => {
    waitingList.push({ uid: uid, socketId: socket.id, location: location });

    if (waitingList.length === 1) {
      socket.join(uid);
      console.log("UID: ", uid);
    } else {
      socket.emit("matched", matchingUser(uid, location));
    }
    socket.emit("matching", "매칭중...");
  });

  socket.on("join_call", (uid, target_uid) => {
    waitingList = waitingList.filter(
      (item) => item.uid !== uid && item.uid !== target_uid
    ); // 대기열 삭제
    console.log("통화를 시작합니다.");
    console.log("welcome to ", target_uid);
    socket.to(target_uid).emit("welcome", target_uid);
    socket.join(target_uid);
  });

  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    io.to(roomName).emit("welcome");
  });

  socket.on("offer", (offer, uid, target_uid) => {
    socket.to(target_uid).emit("offer", offer);
  });

  socket.on("answer", (answer, uid, targetUid) => {
    // io.to(targetUid).emit("answer", answer);
    socket.to(targetUid).emit("answer", answer);
  });

  socket.on("ice", (ice, uid, targetUid) => {
    socket.to(targetUid).emit("ice", ice);
    // socket.emit("ice", ice);
  });

  socket.on("disconnect", () => {
    console.log("disconnect", socket.id);
  });
});

const matchingUser = (_uid, _location) => {
  //나 이외의 접속한 5KM 인근의 랜덤 유저의 정보를 리턴
  const userList = waitingList.filter(
    (item) => getDistance(item.location, _location) <= 5 && item.uid !== _uid
  );
  return userList[parseInt((Math.random() * (userList.length - 1)).toFixed())];
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

const handleListen = () =>
  console.log(`Listening no http://localhost:${portNum}}`);
httpServer.listen(portNum, handleListen);
