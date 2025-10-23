import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./config/dbConnect.js";
import bodyParser from "body-parser";
import authRoute from "./routes/authRoute.js";
import chatRoute from "./routes/chatRoute.js";
dotenv.config();
const port = process.env.PORT;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
// routes
app.use("/api/auth", authRoute);
app.use("/api/chat", chatRoute);
connectDb()
  .then(() => {
    //   console.log("DB connected successfully");
    app.listen(port, () => {
      console.log(`server is running on the ${port} `);
    });
  })
  .catch((err) => {
    console.error("unable to connect to the database ");
  });
