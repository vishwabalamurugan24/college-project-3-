const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    senderEmail: String,
    receiverEmail: String,
    amount: Number,
    type: { type: String, default: "transfer" },
    status: { type: String, default: "pending" },
    fraudFlag: { type: Boolean, default: false },
    fraudDetails: {
        reason: String,
        riskScore: Number
    },
    location: String,
    ipAddress: String
}, { timestamps: true });

transactionSchema.index({ createdAt: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
