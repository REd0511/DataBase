const db = require('../config/db');

// ============================================
// All rewards
// ============================================
exports.getAllRewards = (req, res) => {
    db.query('SELECT * FROM REWARD_ITEM WHERE IsActive = TRUE ORDER BY PointCost', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// ============================================
// Redeem reward
// ============================================
exports.redeemReward = (req, res) => {
    const { MemberID, RewardID, RedemptionDate, PointsUsed } = req.body;
    if (!MemberID || !RewardID || !PointsUsed) {
        return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // 1. Calculate remaining points
    const pointsSql = `
        SELECT COALESCE(SUM(PointsChange), 0) AS Balance
        FROM POINT_TRANSACTION
        WHERE MemberID = ?
    `;
    db.query(pointsSql, [MemberID], (err, results) => {
        if (err) return res.status(500).json(err);
        const balance = Number(results[0].Balance);

        if (balance < PointsUsed) {
            return res.status(400).json({ message: `Insufficient points (Balance: ${balance}, Required: ${PointsUsed})` });
        }

        const redeemDate = RedemptionDate || new Date();

        // 2. INSERT REDEMPTION
        const redeemSql = 'INSERT INTO REDEMPTION (MemberID, RewardID, RedemptionDate, PointsUsed) VALUES (?, ?, ?, ?)';
        db.query(redeemSql, [MemberID, RewardID, redeemDate, PointsUsed], (err, result) => {
            if (err) return res.status(500).json(err);
            const redemptionId = result.insertId;

            // 3. INSERT PAYMENT (Amount=0, link RedemptionID)
            const paymentSql = `
                INSERT INTO PAYMENT 
                (Amount, PaymentDate, PaymentMethod, PaymentStatus, BookingID, RedemptionID, EnrollmentID)
                VALUES (0, NOW(), 'Reward Redemption', 'PAID', NULL, ?, NULL)
            `;
            db.query(paymentSql, [redemptionId], (err2, paymentResult) => {
                if (err2) {
                    console.error('redeemReward payment error:', err2);
                    return res.status(500).json({
                        error: err2.message,
                        hint: 'Check PAYMENT table has EnrollmentID column'
                    });
                }
                const paymentId = paymentResult.insertId;

                // 4. INSERT POINT_TRANSACTION
                // ✅ Fix: use NOW() instead of redeemDate → store real time at redemption
                const pointsSql2 = `
                    INSERT INTO POINT_TRANSACTION (MemberID, PaymentID, PointsChange, Reason, TransactionDate)
                    VALUES (?, ?, ?, 'REDEEM_REWARD', NOW())
                `;
                db.query(pointsSql2, [MemberID, paymentId, -Math.abs(PointsUsed)], (err3) => {
                    if (err3) {
                        console.error('redeemReward points error:', err3);
                        return res.status(500).json({ error: err3.message });
                    }
                    res.status(201).json({
                        message: 'Reward redeemed successfully',
                        RedemptionID: redemptionId,
                        PaymentID: paymentId,
                    });
                });
            });
        });
    });
};

// ============================================
// Member redemption history
// ============================================
exports.getMemberRedemptions = (req, res) => {
    const sql = `
        SELECT r.*, rw.Name AS RewardName, rw.Category
        FROM REDEMPTION r
        JOIN REWARD_ITEM rw ON r.RewardID = rw.RewardID
        WHERE r.MemberID = ?
        ORDER BY r.RedemptionDate DESC, r.RedemptionID DESC
    `;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};