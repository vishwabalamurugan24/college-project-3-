const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const FraudLog = require("../models/FraudLog");

// Admin Stats
router.get("/stats", auth, admin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTransactions = await Transaction.countDocuments();
        const fraudAlerts = await Transaction.countDocuments({ fraudFlag: true });
        res.json({ totalUsers, totalTransactions, fraudAlerts });
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// Flagged Transactions
router.get("/fraud", auth, admin, async (req, res) => {
    try {
        const frauds = await Transaction.find({ fraudFlag: true }).sort({ createdAt: -1 });
        res.json(frauds);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// All Users
router.get("/users", auth, admin, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// Block/Verify User
router.put("/users/:id", auth, admin, async (req, res) => {
    try {
        const { isVerified } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { isVerified }, { new: true }).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// Fraud Logs
router.get("/fraud-logs", auth, admin, async (req, res) => {
    try {
        const logs = await FraudLog.find().sort({ createdAt: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

module.exports = router;
