const express = require("express");
const router = express.Router();

router.get("/hello", async (req, res, next) => {
    return res.status(200).json({
        "message" : "Hello world!"
    });    
})

module.exports = router;