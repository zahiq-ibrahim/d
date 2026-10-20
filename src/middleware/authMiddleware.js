
const { verifyToken } = require("../services/auth/jwtService");

function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is required",
        });
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is required",
        });
    }

    try {
        const payload = verifyToken(token);

        if (!payload.sub) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
        }

        req.auth = {
            userId: payload.sub,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message:
                error.name === "TokenExpiredError"
                    ? "Authentication token has expired"
                    : "Invalid authentication token",
        });
    }
}

module.exports = authMiddleware;
