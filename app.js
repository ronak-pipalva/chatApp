import express from "express";
import dotenv from "dotenv";
import globalErrorHandler from "./middlewares/global_error_handler.js";
import connectDB from "./config/connect_db.js";
import config from "./config/config.js";
import routes from "./routes/index.js";
import { authenticateUser } from "./config/passport-strategy.js";
import passport from "passport";
import { app, server } from "./socket/index.js";

dotenv.config();

authenticateUser(passport);
app.use(express.json());
app.use(routes);

//Global error hnadler
app.use(globalErrorHandler);

app.get("/", (req, res) => {
  res.status(200).json({ message: "ChatApp is online" });
});
server.listen(config.PORT, async () => {
  await connectDB();
  console.log(`ChatApp running on port ${config.PORT}`);
});
