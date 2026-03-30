/**
 * FraudShield AI - Heuristic Detection System
 * This replaces the Python/ML model with a fast JavaScript logic engine.
 */

// Simulated database of known flagged accounts or regions
const flaggedReceivers = ['scam_vault_1', 'shadow_node', 'suspicious_id'];

/**
 * Audit a transaction and return fraud status and reason
 * @param {object} txData - The transaction payload
 * @returns {object} { is_fraud: Boolean, reason: String|null }
 */
function auditTransaction(txData) {
    const { amount, receiver, location_consistency, device_consistency } = txData;
    const numAmount = parseFloat(amount);

    // Rule 1: Node Volume (High Amounts)
    if (numAmount >= 15000) {
        return { is_fraud: true, reason: 'Anomalous High-Volume Transfer Detected' };
    }

    // Rule 2: Destination Risk Profile (Flagged Node)
    if (flaggedReceivers.includes(receiver.toLowerCase())) {
        return { is_fraud: true, reason: 'Destination Wallet matches known Threat Signature' };
    }

    // Rule 3: Environmental Context (Spoofed location/device)
    // The frontend randomly fuzzed these for demo purposes to simulate ML logic
    if (location_consistency === 0 && device_consistency === 0) {
        return { is_fraud: true, reason: 'Multiple Environmental Anomalies: Unrecognized Device & Location' };
    }

    if (numAmount >= 5000 && (location_consistency === 0 || device_consistency === 0)) {
        return { is_fraud: true, reason: 'High-Value Transfer from Unverified Environmental Context' };
    }

    // Default: Safe
    return { is_fraud: false, reason: null };
}

module.exports = { auditTransaction };
