var express = require('express');
var router = express.Router();
var crypto = require('crypto');

var User = require('../models/User');

const isAdmin = require('../middlewares/adminMiddleware');
const { hashPassword } = require('../utils/bcrypt');
const { safeUserOutput, validObjectId } = require('../utils/common');
const { emailAccountSetup } = require('../utils/mailer');

router.get("/me", async (req, res) => {
    return res.status(200).json({ code: 200, data: safeUserOutput(req.user) });
});

router.post("/me", async (req, res) => {
    try {
        const { name, phone, email, username } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ code: 404, message: 'User not found' });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (email) user.email = email;
        if (username) user.username = username;

        await user.save();
    
        return res.status(200).json({ code: 200, message: "Success", data: safeUserOutput(user) });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: "Internal server error" });
    }
});

router.get("/", isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({ code: 200, data: users.map(u => safeUserOutput(u)) });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: "Internal server error" });
    }
});

router.post("/", isAdmin, async (req, res) => {
    try {
        const { name, phone, email, role } = req.body;
        if (!name || !phone || !email || !role) {
            return res.status(400).json({ code: 400, message: "Missing required data" });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(409).json({ code: 409, message: "User with given email or phone already exists" });
        }

        const setupToken = crypto.randomUUID();

        const newUser = new User({
            name,
            phone,
            email,
            role,
            setupToken: await hashPassword(setupToken),
        });

        await newUser.save();
        await emailAccountSetup(email, setupToken);

        return res.status(201).json({ code: 201, message: "Success", data: safeUserOutput(newUser) });
    } catch (err) {
        return res.status(500).json({ code: 500, message: "Internal server error" });
    }
});

router.get("/:id", isAdmin, async (req, res) => {
    try {
        if (!validObjectId(req.params.id)) {
            return res.status(400).json({ code: 400, message: "Invalid user ID" });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ code: 404, message: "User not found" });
        }
        return res.status(200).json({ code: 200, data: safeUserOutput(user) });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: "Internal server error" });
    }
});

router.put("/:id", isAdmin, async (req, res) => {
    try {
        if (!validObjectId(req.params.id)) {
            return res.status(400).json({ code: 400, message: "Invalid user ID" });
        }
        const { name, phone, email, department, username, password, role, enabled } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ code: 404, message: "User not found" });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (email) user.email = email;
        if (username) user.username = username;
        if (password) user.password = await hashPassword(password);
        if (role) user.role = role;
        if (department) user.department = department;
        if (enabled !== undefined) user.enabled = enabled === true || enabled === 'true';
        await user.save();
    
        return res.status(200).json({ code: 200, message: "Success", data: safeUserOutput(user) });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ code: 500, message: "Internal server error" });
    }
});

router.delete("/:id", isAdmin, async (req, res) => {
    try {
        if (!validObjectId(req.params.id)) {
            return res.status(400).json({ code: 400, message: "Invalid user ID" });
        }
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ code: 404, message: "User not found" });
        }

        user.deleted = true;
        await user.save();

        return res.status(200).json({ code: 200, message: "Success", data: safeUserOutput(user) });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: "Internal server error" });
    }
});

module.exports = router;
