const createError = require("http-errors");
const express = require("express");
const path = require("path");
const fileUpload = require("express-fileupload");
const cateNewsRouter = require("./routes/cateNews");
const newsRouter = require("./routes/news");
const loginRouter = require("./routes/login");
const newsEditRouter = require("./routes/newsEditor");
const newsSensorRouter = require("./routes/newsSensor");
const likeRouter = require("./routes/like");
const rateRouter = require("./routes/rate");
const usersRouter = require("./routes/users");
const followersRouter = require("./routes/follow");
const statisticalRouter = require("./routes/statistical");
const commentRouter = require("./routes/comment");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();

app.use(fileUpload());
dotenv.config();
// view engine setup
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Cache-Control, Pragma, Origin, Authorization, token, Access-Control-Allow-Headers, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'Authorization');
  return next();
});


// connect to mongoDB
let urlData = process.env.DATABASE_URL;
const connectMongoDB = async () => {
  try {
    await mongoose.connect(urlData, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Kết nối tới mongoDB thành công!");
  } catch (error) {
    console.error("connect MongoDB has error: " + error)
    && logger.error({status:400, message:"connect MongoDB has error: " + error , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack : err.stack});;
  }
};
connectMongoDB();

app.use("/users", usersRouter);
app.use("/cateNews", cateNewsRouter);
app.use("/news", newsRouter);
app.use("/newsEdits", newsEditRouter);
app.use("/newsSensors", newsSensorRouter);
app.use("/login", loginRouter);
app.use("/likes", likeRouter);
app.use("/rates", rateRouter);
app.use("/statisticals", statisticalRouter);
app.use("/followers", followersRouter);
app.use("/comments", commentRouter);

const port = process.env.PORT || 3333;
if (process.env.NODE_ENV === "production") {
  app.listen(port, () => console.log(`Server started at port: ${port}`));
  // app.use(express.static("client/build"));

  // app.get("*", (req, res) => {
  //   res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  // });
}

app.listen(port, () => console.log(`Server started at port: ${port}`));