function detectFraud(amount) {
    if (amount > 10000) {
        return true;
    }
    return false;
}

module.exports = detectFraud;
