require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const User = require("./models/User");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");
const getChatResponse = require("./config/bot")
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;
const clientorigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Creating the server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: clientorigin,
    credentials: true,
  },
});


// Middleware
app.use(
  cors({
    origin: clientorigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

//connecting db
connectDB();

// defining api routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// handling socket creation and events
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  //when a user is connected, save his new socket id to the db
  socket.on("saveSocketID", async (data) => {
    await User.findOneAndUpdate({ _id: data.userId }, { socketId: socket.id });
  });

  //handle when a user send a message in a conversation
  socket.on("sendMessage", async (message) => {
    const { senderId, conversationId, text } = message;
  
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;
  
      const newMessage = new Message({
        sender: senderId,
        message: text,
      });
      const savedMessage = await newMessage.save();
  
      await Conversation.findByIdAndUpdate(
        conversationId,
        { 
          $push: { messages: savedMessage._id },
          lastUpdated: new Date() 
        },
        { new: true }
      );
      const senderUser = await User.findById(senderId, "username");
      if (!senderUser) throw new Error("Sender not found");
  
      const participants = await User.find({
        _id: { $in: conversation.participants },
      });
  
      const emittedMessage = await savedMessage.populate("sender", "username");
  
      // emit that message to all participants
      // if they are online, their client side code will ensure putting this message in it's conversation swa kant private wla room
      // if they are offline, it was already stored in the db, so when he will connect he will fetch the messages and conversation from the db
      // this mimics what socket does when people are part of a room, it loops over them all and emits the message to each one
      // i found this method to be simpler because it lets me have one simple conversation schema for both private and room conversations
      // the fact that the user socket id is stored everytime in the db play a big role for acheiving this
      // l3zz khdmat
      participants.forEach((user) => {
        if (user.socketId) {
          io.to(user.socketId).emit("receiveMessage", {
            message: emittedMessage,
            conversationId,
          });
        }
      });
  
      // Handle bot interaction
      if (text.startsWith("@chatBot")) {
        const botMessage = text.replace("@chatBot", "").trim();
      
        try {
          // Fetch the conversation details to get the subject
          const conversation = await Conversation.findById(conversationId);
      
          if (!conversation || !conversation.subject) {
            console.error("Conversation or subject not found.");
            return;
          }
      
          const subject = conversation.subject;
      
          // Construct the prompt with the subject-specific constraint
          const botPrompt = `Answer like you are a "${subject}" bot, so don't answer if the question is about a different field. ${botMessage}`;
      
          // Get AI response
          const botResponse = await getChatResponse(botPrompt);
          const chatbotId = "67b9be5876dcba6411261d09";
      
          const botReply = new Message({
            sender: chatbotId,
            message: botResponse,
          });
      
          const savedBotReply = await botReply.save();
      
          await Conversation.findByIdAndUpdate(
            conversationId,
            { $push: { messages: savedBotReply._id } },
            { new: true }
          );
      
          const emittedBotMessage = await savedBotReply.populate("sender", "username");
      
          participants.forEach((user) => {
            if (user.socketId) {
              io.to(user.socketId).emit("receiveMessage", {
                message: emittedBotMessage,
                conversationId,
              });
            }
          });
      
        } catch (error) {
          console.error("Error getting bot response:", error);
        }
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });
  

  socket.on(
    "createPrivateConversation",
    async ({ senderId, receiverId, text }) => {
      try {
        let conversation = await Conversation.findOne({
          participants: { $all: [senderId, receiverId] },
          type: 'private' // Add this line
        });

        if (!conversation) {
          conversation = new Conversation({
            participants: [senderId, receiverId],
            messages: [],
            type: "private",
          });
          await conversation.save();
        }

        const newMessage = new Message({
          sender: senderId,
          message: text,
        });
        const savedMessage = await newMessage.save();

        conversation.messages.push(savedMessage._id);
        conversation.lastUpdated = new Date();
        await conversation.save();

        const senderUser = await User.findById(senderId, "username socketId");
        const receiverUser = await User.findById(
          receiverId,
          "username socketId"
        );

        if (!senderUser || !receiverUser) throw new Error("User not found");

        const emittedMessage = await savedMessage.populate(
          "sender",
          "username"
        );

        [senderUser, receiverUser].forEach((user) => {
          if (user.socketId) {
            io.to(user.socketId).emit("receiveMessage", {
              message: emittedMessage,
              conversationId: conversation._id,
            });
          }
        });

        console.log(
          ` New conversation created & message sent between ${senderUser.username} and ${receiverUser.username}`
        );
      } catch (error) {
        console.error("Error creating private conversation:", error);
      }
    }
  );

  socket.on("createGroupConversation", async ({ name, subject, participants, admin }) => {
    try {
      const newGroup = new Conversation({
        type: "group",
        name,
        subject,
        participants,
        admin
      });

      await newGroup.save();

      io.emit("groupCreated", newGroup);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  });

  socket.on("disconnect", async () => {
    await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null,  lastDisconnected: new Date() });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
