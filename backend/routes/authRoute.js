var express = require('express');
var router = express.Router();

const User = require('../models/User');

const { captchaVerify } = require('../utils/turnstile');
const { sendSMSMessage } = require('../utils/twilio');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { emailAccessCode } = require('../utils/mailer');

router.post("/login/phone/send-code", async (req, res) => {
    try {
        const {phone, captchaResponse} = req.body;
        
        if (!phone || !captchaResponse) {
            return res.status(400).json({ code: 400, message: 'Missing required data' });
        }

        if (!await captchaVerify(captchaResponse, req.ip)) {
            return res.status(400).json({ code: 400, message: 'Captcha verification failed' });
        }

        let user = await User.findOne({ phone });

        if (!user) {
            return res.status(404).json({ code: 404, message: 'User not found' });
        }

        if (!user.enabled) {
            return res.status(401).json({ code: 401, message: 'User is locked' });
        }

        if (user.accessCodeValidUntil > new Date()) {
            return res.status(400).json({ code: 400, message: 'Please try again after 3 minutes' });
        }

        const code = String(Math.floor(Math.random() * 900000)).padStart(6, '0');

        user.accessCode = code;
        user.accessCodeType = "phone";
        user.accessCodeValidUntil = new Date(Date.now() + 3 * 60 * 1000);
        user.accessCodeTryCount = 0;
        await user.save();
        await sendSMSMessage(phone, code);

        return res.status(200).json({ code: 200, message: 'Success' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: 'Internal server error' });
    }
})

router.post('/login/phone/verify', async (req, res) => {
    const { phone, code, captchaResponse } = req.body;
    try {
        if (!phone || !code || !captchaResponse) {
            return res.status(400).json({ code: 400, message: 'Missing required data' });
        }

        if (!await captchaVerify(captchaResponse, req.ip)) {
            return res.status(400).json({ code: 400, message: 'Captcha verification failed' });
        }

        const user = await User.findOne({ phone });

        if (!user) {
            return res.status(400).json({ code: 400, message: 'Invalid or expired code' });
        }

        if (user.accessCodeTryCount >= 5) {
            if (user.accessCode) {
                user.accessCodeType = "";
                user.accessCode = "";
                user.accessCodeValidUntil = null;
                await user.save();
            }
            return res.status(400).json({ code: 400, message: 'Too many failed attempts' });
        }
        
        if (user.accessCodeType === 'phone' && user.accessCode && user.accessCode === code && user.accessCodeValidUntil > new Date()) {
            if (!user.enabled) {
                return res.status(401).json({ code: 401, message: 'User is locked' });
            }

            user.accessCodeTryCount = 0;
            user.accessCode = "";
            user.accessCodeType = "";
            user.accessCodeValidUntil = null;
            await user.save();

            const tokens = generateTokens(user);
            return res.status(200).json({ code: 200, message: 'Success', data: tokens });

        } else {
            user.accessCodeTryCount += 1;
            await user.save();
            return res.status(400).json({ code: 400, message: 'Invalid or expired code' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: 'Internal server error' });
    }
});

router.post("/login/email/send-code", async (req, res) => {
    try {
        const {email, captchaResponse} = req.body;
        
        if (!email || !captchaResponse) {
            return res.status(400).json({ code: 400, message: 'Missing required data' });
        }

        if (!await captchaVerify(captchaResponse, req.ip)) {
            return res.status(400).json({ code: 400, message: 'Captcha verification failed' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ code: 404, message: 'User not found' });
        }

        if (!user.enabled) {
            return res.status(401).json({ code: 401, message: 'User is locked' });
        }

        if (user.accessCodeValidUntil > new Date()) {
            return res.status(400).json({ code: 400, message: 'Please try again after 3 minutes' });
        }

        const code = String(Math.floor(Math.random() * 900000)).padStart(6, '0');

        user.accessCode = code;
        user.accessCodeType = "email";
        user.accessCodeValidUntil = new Date(Date.now() + 3 * 60 * 1000);
        user.accessCodeTryCount = 0;
        await user.save();
        await emailAccessCode(email, code);

        return res.status(200).json({ code: 200, message: 'Success' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: 'Internal server error' });
    }
})

router.post('/login/email/verify', async (req, res) => {
    const { email, code, captchaResponse } = req.body;
    try {
        if (!email || !code || !captchaResponse) {
            return res.status(400).json({ code: 400, message: 'Missing required data' });
        }

        if (!await captchaVerify(captchaResponse, req.ip)) {
            return res.status(400).json({ code: 400, message: 'Captcha verification failed' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ code: 400, message: 'Invalid or expired code' });
        }

        if (user.accessCodeTryCount >= 5) {
            if (user.accessCode) {
                user.accessCodeType = "";
                user.accessCode = "";
                user.accessCodeValidUntil = null;
                user.accessCodeTryCount = 0;
                await user.save();
            }
            return res.status(400).json({ code: 400, message: 'Too many failed attempts' });
        }
        
        if (user.accessCodeType === 'email' && user.accessCode && user.accessCode === code && user.accessCodeValidUntil > new Date()) {
            if (!user.enabled) {
                return res.status(401).json({ code: 401, message: 'User is locked' });
            }

            user.accessCodeTryCount = 0;
            user.accessCode = "";
            user.accessCodeType = "";
            user.accessCodeValidUntil = null;
            await user.save();

            const tokens = generateTokens(user);
            return res.status(200).json({ code: 200, message: 'Success', data: tokens });

        } else {
            user.accessCodeTryCount += 1;
            await user.save();
            return res.status(400).json({ code: 400, message: 'Invalid or expired code' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: 'Internal server error' });
    }
});

router.post('/login/credentials', async (req, res) => {
    try {
        const { username, password, captchaResponse } = req.body;
        if (!username || !password || !captchaResponse) {
            return res.status(400).json({ code: 400, message: 'Missing required data' });
        }

        if (!await captchaVerify(captchaResponse, req.ip)) {
            return res.status(400).json({ code: 400, message: 'Captcha verification failed' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ code: 404, message: 'User not found' });
        }

        if (!user.enabled) {
            return res.status(401).json({ code: 401, message: 'User is locked' });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ code: 401, message: 'Invalid credentials' });
        }

        const tokens = generateTokens(user);
        return res.status(200).json({ code: 200, message: 'Success', data: tokens });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: 'Internal server error' });
    }
});

router.put('/setup/save', async (req, res) => {
    try {
        const { email, token, username, password, retypePassword } = req.body;
        if (!email || !token || !username || !password || !retypePassword) {
            return res.status(400).json({ code: 400, message: 'Missing required data' });
        }

        if (password !== retypePassword) {
            return res.status(400).json({ code: 400, message: 'Passwords do not match' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ code: 404, message: 'User not found' });
        }

        const isValidToken = await comparePassword(token, user.setupToken);
        if (!isValidToken) {
            return res.status(401).json({ code: 401, message: 'Invalid token' });
        }

        user.username = username;
        user.password = await hashPassword(password);
        user.setupToken = "";
        await user.save();

        return res.status(200).json({ code: 200, message: 'Success' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: 'Internal server error' });
    }
});

router.post('/setup/verify', async (req, res) => {
    try {
        const { email, token } = req.body;
        if (!email || !token) {
            return res.status(400).json({ code: 400, message: 'Missing required data' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ code: 404, message: 'User not found' });
        }

        const isValidToken = await comparePassword(token, user.setupToken);
        if (!isValidToken) {
            return res.status(401).json({ code: 401, message: 'Invalid token' });
        }

        return res.status(200).json({ code: 200, message: 'Success' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: 'Internal server error' });
    }
});

router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ code: 400, message: 'Missing required data' });
        }
        const data = verifyRefreshToken(refreshToken);
        const user = await User.findById(data.sub);
        if (!user) {
            return res.status(404).json({ code: 404, message: 'User not found' });
        }

        if (!user.enabled) {
            return res.status(401).json({ code: 401, message: 'User is locked' });
        }

        const tokens = generateTokens(user);
        return res.status(200).json({ code: 200, message: 'Success', data: tokens });
    } catch (err) {
        return res.status(401).json({ code: 401, message: 'Invalid or expired refresh token' });
    }
});
module.exports = router;
