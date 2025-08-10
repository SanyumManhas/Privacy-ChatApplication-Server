const multer = require("multer");

const storage = multer.memoryStorage(); // ✅ Use in-memory buffer, not disk

const upload = multer({ storage });

module.exports = upload;
