import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./config/dbConnect.js";
dotenv.config();
const port = process.env.PORT;
const app = express();
connectDb().then(() => {
  console.log("DB connected successfully");
  app.listen(port, () => {
    console.log(`server is running on the ${port} `);
  });
}).catch((err)=>{
     console.error("unable to connect to the database ");
});
