const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Dashboard
router.get("/dashboard", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// Profile
router.get("/profile", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// Update Profile
router.put("/update", auth, async (req, res) => {
    try {
        const { name, phone, location } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, { name, phone, location }, { new: true }).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// Change Password
router.put("/change-password", auth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        const valid = await bcrypt.compare(oldPassword, user.password);
        if (!valid) return res.status(400).json("Wrong current password");
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json("Password updated");
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// Get Notifications
router.get("/notifications", auth, async (req, res) => {
    try {
        const notifs = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(notifs);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

module.exports = router;
