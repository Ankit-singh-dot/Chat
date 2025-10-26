import { Server, Socket } from "socket.io";
import User from "../models/User.js";
import Message from "../models/Messages.js";

const onlineUser = new Map();
const typingUsers = new Map();
export const initializeSocket = (server) => {
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

    // add or update reaction on message
    socket.on(
      "add_reaction",
      async ({ messageId, emoji, userId, reactionUserId }) => {
        try {
          const message = await Message.findById(messageId);
          if (!message) return;
          const existingIndex = message.reactions.findIndex(
            (r) => r.user.toString() === reactionUserId
          );
          if (existingIndex > -1) {
            const exiting = message.reactions[existingIndex];
            if (exiting.emoji === emoji) {
              // remove same reaction
              message.reactions.splice(existingIndex, 1);
            } else {
              // change emoji
              message.reactions[existingIndex].emoji = emoji;
            }
          } else {
            message.reactions.push({ user: reactionUserId, emoji });
          }
          await message.save();

          const populatedMessage = await Message.findOne(message?.id)
            .populate("sender", "userName profilePicture")
            .populate("receiver", "userName profilePicture")
            .populate("reactions.user", "userName");

          const reactionUpdated = {
            messageId,
            reactions: populatedMessage.reactions,
          };
          const senderSocket = onlineUser.get(
            populatedMessage.sender._id.toString()
          );
          const receiverSocket = onlineUser.get(
            populatedMessage.receiver._id.toString()
          );
          if (senderSocket)
            io.to(senderSocket).emit("reaction_update", reactionUpdated);
          if (receiverSocket)
            io.to(reactionUserId).emit("reaction_updated", reactionUpdated);
        } catch (error) {
          console.log("Error handling reactions", error);
        }
      }
    );
    const handleDisconnect = async () => {
      if (!userId) return;

      try {
        onlineUser.delete(userId);

        if (typingUsers.has(userId)) {
          const userTyping = typingUsers.get(userId);
          Object.keys(userTyping).forEach((key) => {
            if (key.endsWith("_timeout")) clearTimeout(userTyping[key]);
          });
          typingUsers.delete(userId);
        }
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
        io.emit("user_status"),
          {
            userId,
            isOnline: false,
            lastSeen: new Date(),
          };
        socket.leave(userId);
        console.log(`user ${userId} disconnected`);
      } catch (error) {
        console.error("error handling disconnection ", error);
      }
    };
    socket.on("disconnect", handleDisconnect);
  });
  //   attach the onlineUserMap to socket for external use
  io.socketUserMap = onlineUser;
  return io;
};

