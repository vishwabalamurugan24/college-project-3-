const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, index: true },
    password: String,
    balance: { type: Number, default: 5000 },
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: true },
    phone: String,
    location: { type: String, default: "India" },
    security: {
        twoFA: { type: Boolean, default: false },
        lastLogin: Date,
        device: String
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
