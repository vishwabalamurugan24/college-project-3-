const mongoose = require("mongoose");

const fraudLogSchema = new mongoose.Schema({
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: String,
    riskScore: Number,
    actionTaken: { type: String, default: "Flagged" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FraudLog", fraudLogSchema);
