const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const Chat = require('../models/Chat');
const User = require('../models/User');

let io;

const onlineUsers = new Map();

function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.query.token || socket.handshake.auth.token;
            
            if (!token) {
                return next(new Error("Authentication error"));
            }

            const decoded = verifyToken(token);
            const user = await User.findById(decoded.sub).select("-password");
            if (!user) {
                return next(new Error("Authentication error"));
            }

            socket.userId = user._id.toString();
            socket.user = user;
            
            next();
        } catch (err) {
            console.log(err);
            next(new Error("Authentication error"));
        }
    });

    io.engine.on("connection_error", (err) => {
        console.log(err);
    });

    io.on("connection", async (socket) => {
        try {
            console.log(`User connected: ${socket.userId}`);

            onlineUsers.set(socket.userId, {
                socketId: socket.id,
                user: socket.user
            });

            io.emit("online-users-updated", {
                onlineUserIds: Array.from(onlineUsers.keys())
            });

            socket.join(socket.userId);

            const userChats = await joinUserChatRooms(socket);
            
            socket.emit("user-chats-synced", { 
                chatCount: userChats.length
            });
        } catch (err) {
            console.log(err);
            socket.emit("error", { message: "Failed to initialize connection" });
            socket.disconnect(true);
            return;
        }

        socket.on("send-message", async (data) => {
            await handleSendMessage(socket, data);
        });

        socket.on("create-chat", async (data) => {
            await handleCreateChat(socket, data);
        });

        socket.on("join-chat", async (chatId) => {
            await handleJoinChat(socket, chatId);
        });

        socket.on("error", (err) => {
            console.log(err);
            socket.emit("error", { message: error.message || "An error occurred" });
            socket.disconnect(true);
        });

        socket.on("disconnect", () => {
            
            onlineUsers.delete(socket.userId);
            
            io.emit("online-users-updated", {
                onlineUserIds: Array.from(onlineUsers.keys())
            });
        });
    });

    return io;
}


async function joinUserChatRooms(socket) {
    try {
        const chats = await Chat.find({
            participants: socket.userId
        }).select("_id");

        const chatIds = chats.map(c => c._id.toString());
        socket.join(chatIds);
        return chats;
    } catch (err) {
        console.log(err);
        return [];
    }
}

async function handleSendMessage(socket, data) {
    try {
        const { chatId, content } = data;

        if (!chatId || !content || !content.trim()) {
            socket.emit("error", { message: "Invalid message data" });
            return;
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            socket.emit("error", { message: "Chat not found" });
            return;
        }

        if (!chat.participants.some(p => p.toString() === socket.userId)) {
            socket.emit("error", { message: "Not authorized to send messages in this chat" });
            return;
        }

        const newMessage = {
            sender: socket.userId,
            content: content.trim(),
            timestamp: new Date()
        };

        chat.messages.push(newMessage);
        await chat.save();

        const populatedChat = await Chat.findById(chatId)
            .populate("messages.sender", "name email")
            .select("messages");
        
        const savedMessage = populatedChat.messages[populatedChat.messages.length - 1];

        io.to(chatId).emit("new-message", {
            chatId: chatId,
            message: savedMessage
        });
    } catch (err) {
        console.log(err);
        socket.emit("error", { message: "Failed to send message" });
    }
}


async function handleCreateChat(socket, data) {
    try {
        const { participantIds } = data;

        if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
            socket.emit("error", { message: "Invalid participant data" });
            return;
        }

        const allParticipants = [...new Set([socket.userId, ...participantIds])];

        const existingChat = await Chat.findOne({
            participants: { $all: allParticipants, $size: allParticipants.length }
        }).populate("participants", "name email");

        if (existingChat) {
            socket.emit("chat-created", { chat: existingChat });
            socket.join(existingChat._id.toString());
            return;
        }

        const newChat = new Chat({
            participants: allParticipants,
            messages: []
        });

        await newChat.save();

        const populatedChat = await Chat.findById(newChat._id)
            .populate("participants", "name email");

        allParticipants.forEach(participantId => {
            io.to(participantId).emit("chat-created", { chat: populatedChat });
            
            const userSockets = Array.from(io.sockets.sockets.values())
                .filter(s => s.userId === participantId);
            
            if (userSockets.length > 0) {
                userSockets.forEach(s => {
                    s.join(newChat._id.toString());
                });
            }
        });
    } catch (err) {
        console.log(err);
        socket.emit("error", { message: "Failed to create chat"  });
    }
}

async function handleJoinChat(socket, chatId) {
    try {
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
            socket.emit("error", { message: "Chat not found" });
            return;
        }

        if (!chat.participants.some(p => p.toString() === socket.userId)) {
            socket.emit("error", { message: "Not authorized to join this chat" });
            return;
        }

        socket.join(chatId);        
        socket.emit("chat-joined", { chatId });
    } catch (err) {
        console.log(err);
        socket.emit("error", { message: "Failed to join chat" });
    }
}

function getIO() {
    if (!io) {
        throw new Error('Internal server error');
    }
    return io;
}

function getOnlineUsers() {
    return Array.from(onlineUsers.keys());
}

function notifyTaskUpdate(task, updatedBy, updateType = 'updated') {
    if (!io) {
        console.log('Socket.io not initialized');
        return;
    }

    try {
        const assigneeIds = task.assignees.map(id => id.toString());
        const updatedById = updatedBy.toString();
        
        assigneeIds.forEach(assigneeId => {
            if (assigneeId !== updatedById) {
                io.to(assigneeId).emit('task-updated', {
                    task: task,
                    updateType: updateType,
                    updatedBy: updatedById,
                    timestamp: new Date()
                });
            }
        });
        
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    initializeSocket,
    getIO,
    getOnlineUsers,
    notifyTaskUpdate
};
