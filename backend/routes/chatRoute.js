const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User');
const { getOnlineUsers } = require('../services/socketService');

router.get("/available-users", async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let query = { _id: { $ne: req.user._id } };

        if (currentUser.role === "employee") {
            query.role = "employyee";
        }

        const users = await User.find(query).select("_id name email role");
        
        const onlineUserIds = getOnlineUsers();
        
        const usersWithStatus = users.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isOnline: onlineUserIds.includes(user._id.toString())
        })).sort((a, b) => {
            if (a.isOnline === b.isOnline) {
                return a.name.localeCompare(b.name);
            }
            return a.isOnline ? -1 : 1;
        });

        res.json({
            success: true,
            data: usersWithStatus
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


router.get('/', async (req, res) => {
    try {
        const userId = req.user._id;

        const chats = await Chat.find({
            participants: userId
        })
        .populate('participants', 'name email')
        .populate('messages.sender', 'name email')
        .sort({ updatedAt: -1 });

        res.json({
            success: true,
            data: chats
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.get('/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId)
            .populate("participants", "name email")
            .populate("messages.sender", "name email");

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        const isParticipant = chat.participants.some(
            p => p._id.toString() === userId
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        res.json({
            success: true,
            data: chat
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const { participantIds } = req.body;
        const userId = req.user._id;

        if (!participantIds || !Array.isArray(participantIds)) {
            return res.status(400).json({
                success: false,
                message: "Invalid participant data"
            });
        }

        const allParticipants = [...new Set([userId, ...participantIds])];

        const existingChat = await Chat.findOne({
            participants: { $all: allParticipants, $size: allParticipants.length }
        }).populate("participants", "name email");

        if (existingChat) {
            return res.json({
                success: true,
                data: existingChat,
                message: "Chat already exists"
            });
        }

        const users = await User.find({ _id: { $in: allParticipants } });
        if (users.length !== allParticipants.length) {
            return res.status(400).json({
                success: false,
                message: "One or more participants not found"
            });
        }

        const newChat = new Chat({
            participants: allParticipants,
            messages: []
        });

        await newChat.save();

        const populatedChat = await Chat.findById(newChat._id)
            .populate("participants", "name email");

        res.status(201).json({
            success: true,
            data: populatedChat,
            message: "Chat created successfully"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.get("/:chatId/messages", async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;
        const { limit = 50, skip = 0 } = req.query;

        const chat = await Chat.findById(chatId)
            .populate("participants", "name email")
            .populate("messages.sender", "name email");

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Not found"
            });
        }

        const isParticipant = chat.participants.some(
            p => p._id.toString() === userId
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this chat"
            });
        }

        const messages = chat.messages
            .slice(parseInt(skip), parseInt(skip) + parseInt(limit));

        res.json({
            success: true,
            data: {
                chatId: chat._id,
                messages: messages,
                total: chat.messages.length,
                hasMore: parseInt(skip) + parseInt(limit) < chat.messages.length
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const { userId: targetUserId } = req.params;
        const currentUserId = req.user._id;

        const targetUser = await User.findById(targetUserId).select("name email");
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const existingChat = await Chat.findOne({
            participants: { $all: [currentUserId, targetUserId], $size: 2 }
        })
        .populate("participants", "name email")
        .populate("messages.sender", "name email");

        if (existingChat) {
            return res.json({
                success: true,
                data: existingChat
            });
        }

        const newChat = new Chat({
            participants: [currentUserId, targetUserId],
            messages: []
        });

        await newChat.save();

        const populatedChat = await Chat.findById(newChat._id)
            .populate("participants", "name email");

        res.status(201).json({
            success: true,
            data: populatedChat
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

module.exports = router;
