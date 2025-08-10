const express = require('express');
const router = express.Router();
const upload = require("./multerConfig");

const userController = require('../Controllers/userController');

router.post("/api/createUser",upload.single('picture'),userController.createUser);
router.post("/api/login",userController.loginUser);
router.post("/api/logout",userController.logoutUser);
router.post("/api/findUsers",userController.findUsers);
router.get("/api/getUser",userController.getUser);

module.exports = router;