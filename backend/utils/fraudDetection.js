function detectFraud(amount) {
    let riskScore = 0;
    let reason = "";

    if (amount > 10000) {
        riskScore = 85;
        reason = "High amount";
    } else if (amount > 5000) {
        riskScore = 50;
        reason = "Medium amount";
    }

    return {
        isFraud: riskScore >= 70,
        riskScore,
        reason
    };
}

module.exports = detectFraud;
