function checkFraud() {
    const isFraud = Math.random() > 0.7; // 30% chance for demo
    if (isFraud) {
        alert("⚠️ WARNING: High Risk of Fraud Detected!");
    } else {
        alert("✅ Transaction Checked: Safe to Proceed.");
    }
}
