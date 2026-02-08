const jwt = require('jsonwebtoken');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

const createAccessToken = (payload) => {
    return jwt.sign(payload, JWT_ACCESS_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRES_IN,
    });
};

const createRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
};

const generateTokens = (user) => {
    const payload = {
        sub: user._id
    };

    return {
        accessToken: createAccessToken(payload),
        refreshToken: createRefreshToken(payload),
    };
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (err) {
        console.log(err);
        throw new Error('Invalid or expired token');
    }
};

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
        console.log(err);
        throw new Error('Invalid or expired refresh token');
    }
}

module.exports = {
    createAccessToken,
    createRefreshToken,
    generateTokens,
    verifyToken,
    verifyRefreshToken
};
