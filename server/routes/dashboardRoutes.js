const express = require("express");
const router = express.Router();
const { getSummary, getCategoriesData, getMonthlyTrend } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authmiddleware");

router.get("/summary", protect, getSummary);
router.get("/categories", protect, getCategoriesData);
router.get("/monthly", protect, getMonthlyTrend);

module.exports = router;
