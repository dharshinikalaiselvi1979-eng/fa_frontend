const express = require("express");
const router = express.Router();
const { chat, getSummary, getHealthScore } = require("../controllers/aiController");
const { protect } = require("../middleware/authmiddleware");

router.post("/chat", protect, chat);
router.get("/summary", protect, getSummary);
router.get("/health-score", protect, getHealthScore);

module.exports = router;
