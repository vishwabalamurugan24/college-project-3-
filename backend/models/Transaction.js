const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
    amount: Number,
    status: { type: String, default: "pending" },
    fraudFlag: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
