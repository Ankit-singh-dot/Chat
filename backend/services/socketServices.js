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

    // return online status of requested user
    socket.on("get_user_status", (requestedUserId, callback) => {
      const isOnline = onlineUser.has(requestedUserId);
      callback({
        userId: requestedUserId,
        isOnline,
        lastSeen: isOnline ? new Date() : null,
      });
    });

    // forward message to receiver if online
    socket.on("send_message", async (message) => {
      try {
        const receiverSocketId = onlineUser.get(message.receiver?._id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiver_message", message);
        }
      } catch (error) {
        console.error("Error sending message", error);
        socket.emit("message_error", { error: "Failed to send message" });
      }

      //   update message as read and notify sender

      socket.on("message_read", async ({ messageIds, senderId }) => {
        try {
          await Message.updateMany(
            { _id: { $in: messageIds } },
            { $set: { messageStatus: "read" } }
          );

          const senderSocketId = onlineUser.get(senderId);
          if (senderSocketId) {
            messageIds.forEach((messageIds) => {
              io.to(senderSocketId).emit("message_status_updated", {
                messageIds,
                messageStatus: "read",
              });
            });
          }
        } catch (error) {
          console.error("Error updating message read status", error);
        }

        // handle typing start event and auto-stop after 3s
        socket.on("typing_start", async ({ conversationId, receiverId }) => {
          if (!userId || !receiverId || !conversationId) return;
          if (!typingUsers.has(userId)) typingUsers.set(userId, {});
          const userTyping = typingUsers.get(userId);
          userTyping[conversationId] = true;
          // clear any exiting timeout
          if (userTyping[`${conversationId}_timeout`]) {
            clearTimeout(userTyping[`${conversationId}_timeout`]);
          }

          //   auto stop after 3 sec
          userTyping[`${conversationId}_timeout`] = setTimeout(() => {
            userTyping[conversationId] = false;
            socket.to(receiverId).emit("user_typing", {
              userId,
              conversationId,
              isTyping: false,
            });
          }, 3000);

          //   notify receiver
          socket.to(receiverId).emit("user_typing", {
            userId,
            isTyping: true,
            conversationId,
          });

          //   stop by ourself

          socket.on("trying_stop", ({ conversationId, receiverId }) => {
            if (!userId || !conversationId || !receiverId) return;
            if (typingUsers.has(userId)) {
              const userTyping = typingUsers.get(userId);
              userTyping[conversationId] = false;

              if (userTyping[`${conversationId}_timeout`]) {
                clearTimeout(userTyping[`${conversationId}_timeout`]);
                delete userTyping[`${conversationId}_timeout`];
              }
            }
            socket.to(receiverId).emit("user_typing", {
              userId,
              conversationId,
              isTyping: false,
            });
          });
        });
      });
    });
  });
};
