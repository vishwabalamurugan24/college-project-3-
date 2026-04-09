const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

router.get("/dashboard", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

module.exports = router;
