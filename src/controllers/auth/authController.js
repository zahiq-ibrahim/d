const authService = require("../../services/auth/authService");

async function signup(req, res, next) {
    try {
        const result = await authService.signup(
            req.body.email,
            req.body.password,
            req.body.userName,
        );

        res.status(201).json({
            success: true,
            message: "Signup successful. Verify your email using the OTP sent.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function verifyEmail(req, res, next) {
    try {
        const result = await authService.verifyEmail(
            req.body.email,
            req.body.otp
        );

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function resendOtp(req, res, next) {
    try {
        const result = await authService.resendOtp(req.body.email);

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const result = await authService.login(
            req.body.email,
            req.body.password
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function resetPasswordRequest(req, res, next) {
    try{
        await authService.resetPasswordRequest(
            req.body.email
        );
        res.status(200).json({
            success: true,
            message: "Reset request successful, otp has been sent to your email.",
        });

    }catch(error){
        next(error);
    }
}

async function resetPassword(req, res, next) {
    try{
        await authService.resetPassword(
            req.body.email,
            req.body.otp,
            req.body.newPassword,
        );
        res.status(200).json({
            success: true,
            message: "Password reset successfully.",
        });

    }catch(error){
        next(error);
    }
}

module.exports = {
    signup,
    verifyEmail,
    resendOtp,
    login,
    resetPasswordRequest,
    resetPassword,
};
