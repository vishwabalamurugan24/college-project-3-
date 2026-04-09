const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const detectFraud = require("../utils/fraudDetection");

// Transfer Money
router.post("/transfer", auth, async (req, res) => {
    try {
        const { receiverEmail, amount } = req.body;

        const sender = await User.findById(req.user.id);
        if (!sender) return res.status(404).json("Sender not found");
        
        const receiver = await User.findOne({ email: receiverEmail });
        if (!receiver) return res.status(404).json("Receiver not found");

        if (sender.balance < amount)
            return res.status(400).json("Insufficient balance");

        const fraud = detectFraud(amount);

        // Update balances
        sender.balance -= amount;
        receiver.balance += amount;

        await sender.save();
        await receiver.save();

        const transaction = await Transaction.create({
            sender: sender.email,
            receiver: receiver.email,
            amount,
            status: fraud ? "flagged" : "completed",
            fraudFlag: fraud
        });

        res.json(transaction);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// Get Transactions
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json("User not found");

        const data = await Transaction.find({
            $or: [{ sender: user.email }, { receiver: user.email }]
        });

        res.json(data);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

module.exports = router;
