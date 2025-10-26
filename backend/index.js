import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./config/dbConnect.js";
import bodyParser from "body-parser";
import authRoute from "./routes/authRoute.js";
import chatRoute from "./routes/chatRoute.js";
import {initializeSocket} from "./services/socketServices.js";
import http from "node:http";
dotenv.config();
const port = process.env.PORT;
const corsOption = {
  origin: process.env.FRONTEND_URL,
  credential: true,
};

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOption));

// server
const server = http.createServer(app);
const io = initializeSocket(server);
app.use((req, res, next) => {
  req.io = io;
  req.socketUserMap = io.socketUserMap;
  next();
});

// routes
app.use("/api/auth", authRoute);
app.use("/api/chat", chatRoute);
connectDb()
  .then(() => {
    //   console.log("DB connected successfully");
    server.listen(port, () => {
      console.log(`server is running on the ${port} `);
    });
  })
  .catch((err) => {
    console.error("unable to connect to the database ");
  });
