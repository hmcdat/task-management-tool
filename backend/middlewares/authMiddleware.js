const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

module.exports = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (header && header.startsWith("Bearer ")) {
            const token = header.split(" ")[1];
            const decoded = verifyToken(token);
            const user = await User.findById(decoded.sub);
            if (user && user.enabled) {
                req.user = user;
                next();
                return;
            }
        }
        throw new Error();
    } catch (err) {
        return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
};