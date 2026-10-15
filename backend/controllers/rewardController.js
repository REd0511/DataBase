const db = require('../config/db');

// ============================================
// รางวัลทั้งหมด
// ============================================
exports.getAllRewards = (req, res) => {
    db.query('SELECT * FROM REWARD_ITEM WHERE IsActive = TRUE ORDER BY PointCost', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// ============================================
// แลกรางวัล (BR18: PointTransaction ต้องมี PaymentID)
// ✅ แก้: ให้ TransactionDate ใช้ NOW() เพื่อเก็บเวลาจริง
// ============================================
exports.redeemReward = (req, res) => {
    const { MemberID, RewardID, RedemptionDate, PointsUsed } = req.body;
    if (!MemberID || !RewardID || !PointsUsed) {
        return res.status(400).json({ message: 'กรอกข้อมูลให้ครบ' });
    }

    // 1. คำนวณแต้มคงเหลือ
    const pointsSql = `
        SELECT COALESCE(SUM(PointsChange), 0) AS Balance
        FROM POINT_TRANSACTION
        WHERE MemberID = ?
    `;
    db.query(pointsSql, [MemberID], (err, results) => {
        if (err) return res.status(500).json(err);
        const balance = Number(results[0].Balance);

        if (balance < PointsUsed) {
            return res.status(400).json({ message: `แต้มไม่พอ (มี ${balance}, ต้องใช้ ${PointsUsed})` });
        }

        const redeemDate = RedemptionDate || new Date();

        // 2. INSERT REDEMPTION
        const redeemSql = 'INSERT INTO REDEMPTION (MemberID, RewardID, RedemptionDate, PointsUsed) VALUES (?, ?, ?, ?)';
        db.query(redeemSql, [MemberID, RewardID, redeemDate, PointsUsed], (err, result) => {
            if (err) return res.status(500).json(err);
            const redemptionId = result.insertId;

            // 3. INSERT PAYMENT (Amount=0, ผูก RedemptionID)
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
                // ✅ แก้: ใช้ NOW() แทน redeemDate → เก็บเวลาจริงตอน redeem
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
                        message: 'แลกรางวัลสำเร็จ',
                        RedemptionID: redemptionId,
                        PaymentID: paymentId,
                    });
                });
            });
        });
    });
};

// ============================================
// ประวัติการแลกรางวัลของสมาชิก
// ✅ แก้: เรียงตาม RedemptionDate + RedemptionID DESC
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