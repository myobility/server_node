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
app.listen(portNum, handleListen);
