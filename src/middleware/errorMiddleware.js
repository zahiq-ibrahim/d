
function errorMiddleware(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "An account with this email already exists",
        });
    }

    const statusCode = err.statusCode || 500;

    if (statusCode >= 500) {
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message:
            statusCode >= 500
                ? "Internal server error"
                : err.message,
    });
}

module.exports = errorMiddleware;
