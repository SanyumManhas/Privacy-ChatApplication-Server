const express = require('express');
const router = express.Router();

const msgController = require("../Controllers/msgController");

router.post("/api/sendMsg",msgController.sendMsg);
router.get("/api/getMsgs",msgController.getMsgs);

module.exports = router