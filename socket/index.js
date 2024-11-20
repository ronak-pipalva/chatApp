import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import express from "express";
import {
  getConversation,
  getUserDetailsFromToken,
} from "../utils/utility_functions.js";
import Models from "../models/index.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOW_ORIGIN,
    credentials: true,
  },
});

const online_user = new Set();

io.on("connection", async (socket) => {
  console.log("socket user", socket.id);

  const token = socket.handshake.headers.authorization.split(" ").at(-1);

  const user = await getUserDetailsFromToken(token);

  //create room
  socket.join(user?._id.toString());
  online_user.add(user?._id?.toString());

  io.emit("online-user", Array.from(online_user));

  socket.on("message-page", async (data) => {
    if (typeof data === "string") {
      data = JSON.parse(data);
    }
    const user_id = data.user_id;
    const user = await Models.user.findById(user_id);
    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      online: online_user.has(user_id),
      profile_image: user.profile_image,
    };
    socket.emit("message-page", payload);
  });

  // new message

  socket.on("new-message", async (data) => {
    if (typeof data === "string") {
      data = JSON.parse(data);
    }
    let conevrsation = await Models.conversation.findOne({
      $or: [
        { sender: data.sender, receiver: data.receiver },
        { sender: data.receiver, receiver: data.sender },
      ],
    });

    if (!conevrsation) {
      conevrsation = await Models.conversation.create({
        sender: data.sender,
        receiver: data.receiver,
      });
    }

    const message = await Models.message.create({
      text: data?.text,
      image_url: data.image_url,
      video_url: data.video_url,
      sender: data.sender,
    });

    const updated_conversation = await Models.conversation.findOneAndUpdate(
      { _id: conevrsation._id },
      { $push: { messages: message?._id } }
    );

    const get_conversation = await Models.conversation
      .findOne({
        $or: [
          { sender: data.sender, receiver: data.receiver },
          { sender: data.receiver, receiver: data.sender },
        ],
      })
      .populate("messages");

    io.to(data?.sender).emit("message", get_conversation?.messages || []);
    io.to(data?.receiver).emit("message", get_conversation?.messages || []);

    //conversation sidebar

    const conevrsationSender = await getConversation(data?.sender);
    const conevrsationReceiver = await getConversation(data?.receiver);

    io.to(data?.sender).emit("conversation", conevrsationSender);
    io.to(data?.receiver).emit("conversation", conevrsationReceiver);
  });

  //sideBar
  socket.on("sidebar", async (data) => {
    if (typeof data === "string") {
      data = JSON.parse(data);
    }

    const conversation = await getConversation(data.user_id);

    console.log("conversation", conversation);

    socket.emit("conversation", conversation);
  });

  //seen

  socket.on("seen", async (data) => {
    if (typeof data === "string") {
      data = JSON.parse(data);
    }

    console.log("user>>>", user._id.toString());

    let conevrsation = await Models.conversation.findOne({
      $or: [
        { sender: user?._id.toString(), receiver: data.user_id },
        { sender: data.user_id, receiver: user?._id.toString() },
      ],
    });

    const conevrsationMessageIds = conevrsation?.messages || [];

    const updateMessages = await Models.message.updateMany(
      {
        _id: { $in: conevrsationMessageIds },
        sender: user?._id,
      },
      { $set: { seen: true } }
    );

    //send conversation
    const conevrsationSender = await getConversation(user?._id);
    const conevrsationReceiver = await getConversation(data?.user_id);

    io.to(user?._id.toString()).emit("conversation", conevrsationSender);
    io.to(data?.user_id).emit("conversation", conevrsationReceiver);
  });

  io.on("disconnect", () => {
    online_user.delete(user?._id);
    console.log("didisconnected user");
  });
});

export { server, app };
