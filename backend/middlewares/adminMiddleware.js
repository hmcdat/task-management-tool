const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

module.exports = async (req, res, next) => {
    try {
        if (req.user && ["admin", "manager"].includes(req.user.role)) {
            return next();
        }
        throw new Error();
    } catch (err) {
        return res.status(403).json({ code: 403, message: "Forbidden access" });
    }
};