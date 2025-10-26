import { Server, Socket } from "socket.io";
import User from "../models/User";
import Message from "../models/Messages";

const onlineUser = new Map();
const typingUsers = new Map();
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
    },
    pingTimeout: 60000,
  });

  // new connection established
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id} `);
    let userId = null;

    // user connection and mark them online in db
    socket.on("user_connected", async (connectingUserId) => {
      try {
        userId = connectingUserId;
        onlineUser.set(userId, socket.id);
        socket.join(userId);

        // update user in db
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });
        // notify all the user that user is online
        io.emit("user_status", { userId, isOnline: true });
      } catch (error) {
        console.error("Error handling user connection");
      }
    });
  });
};
