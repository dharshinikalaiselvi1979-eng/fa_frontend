const express = require("express");
const router = express.Router();
const { setBudget, getBudget } = require("../controllers/budgetController");
const { protect } = require("../middleware/authmiddleware");

router.route("/").post(protect, setBudget);
router.route("/:month").get(protect, getBudget);

module.exports = router;
