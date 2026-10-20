const jwt = require("jsonwebtoken");

function generateToken(user) {
    return jwt.sign(
        {},
        process.env.JWT_SECRET,
        {
            subject: user._id.toString(),
            expiresIn: process.env.JWT_EXPIRES_IN || "1h",
            algorithm: "HS256",
        }
    );
}

function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
    });
}

module.exports = {
    generateToken,
    verifyToken,
};
