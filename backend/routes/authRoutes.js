const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed
        });

        res.json(user);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json("User not found");

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json("Wrong password");

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "secret"
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json(err.message);
    }
});

module.exports = router;
