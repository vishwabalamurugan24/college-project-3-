const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");
    } catch (err) {
        console.error("Database connection failed:", err.message);
        // Do not exit process in development, just log error
    }
};

module.exports = connectDB;
