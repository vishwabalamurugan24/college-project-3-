const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const FraudLog = require("../models/FraudLog");
const Notification = require("../models/Notification");
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

        sender.balance -= amount;
        receiver.balance += amount;
        await sender.save();
        await receiver.save();

        const transaction = await Transaction.create({
            senderId: sender._id,
            receiverId: receiver._id,
            senderEmail: sender.email,
            receiverEmail: receiver.email,
            amount,
            type: "transfer",
            status: fraud.isFraud ? "flagged" : "completed",
            fraudFlag: fraud.isFraud,
            fraudDetails: fraud.isFraud ? { reason: fraud.reason, riskScore: fraud.riskScore } : {},
            ipAddress: req.ip
        });

        if (fraud.isFraud) {
            await FraudLog.create({
                transactionId: transaction._id,
                userId: sender._id,
                reason: fraud.reason,
                riskScore: fraud.riskScore,
                actionTaken: "Flagged"
            });
            await Notification.create({
                userId: sender._id,
                message: `Suspicious transaction of ₹${amount} flagged.`,
                type: "alert"
            });
        }

        res.json(transaction);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// Get Transactions
router.get("/", auth, async (req, res) => {
    try {
        const data = await Transaction.find({
            $or: [{ senderId: req.user.id }, { receiverId: req.user.id }]
        }).sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

module.exports = router;
