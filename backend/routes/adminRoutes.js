const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const Transaction = require("../models/Transaction");

// Get all flagged transactions
router.get("/fraud", auth, admin, async (req, res) => {
    try {
        const frauds = await Transaction.find({ fraudFlag: true });
        res.json(frauds);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

module.exports = router;
