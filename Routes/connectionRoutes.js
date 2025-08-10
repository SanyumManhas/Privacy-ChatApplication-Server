const express = require('express');
const router = express.Router();

const connController = require("../Controllers/connectionController");

router.post("/api/createConnection",connController.createConn);
router.get("/api/getConnections", connController.getConnections);

module.exports = router