const db = require('../config/db');

// รางวัลทั้งหมด
exports.getAllRewards = (req, res) => {
    db.query('SELECT * FROM REWARD_ITEM', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// แลกรางวัล (ตรวจสอบแต้มก่อน)
exports.redeemReward = (req, res) => {
    const { MemberID, RewardID, RedemptionDate, PointsUsed } = req.body;
    if (!MemberID || !RewardID || !PointsUsed) {
        return res.status(400).json({ message: 'กรอกข้อมูลให้ครบ' });
    }

    // คำนวณแต้มคงเหลือ
    const pointsSql = `
        SELECT COALESCE(SUM(pt.PointsEarned) - SUM(pt.PointsRedeemed), 0) AS Balance
        FROM POINT_TRANSACTION pt
        WHERE pt.PaymentID IN (
            SELECT p.PaymentID FROM PAYMENT p
            JOIN BOOKING b ON p.BookingID = b.BookingID
            WHERE b.MemberID = ?
        )
    `;
    db.query(pointsSql, [MemberID], (err, results) => {
        if (err) return res.status(500).json(err);
        const balance = results[0].Balance;

        if (balance < PointsUsed) {
            return res.status(400).json({ message: `แต้มไม่พอ (มี ${balance}, ต้องใช้ ${PointsUsed})` });
        }

        // บันทึกการแลก
        const redeemSql = 'INSERT INTO REDEMPTION (MemberID, RewardID, RedemptionDate, PointsUsed) VALUES (?, ?, ?, ?)';
        db.query(redeemSql, [MemberID, RewardID, RedemptionDate || new Date(), PointsUsed], (err, result) => {
            if (err) return res.status(500).json(err);

            // หา PaymentID ของสมาชิกเพื่อบันทึกการหักแต้ม
            const findPaymentSql = `
                SELECT p.PaymentID FROM PAYMENT p
                JOIN BOOKING b ON p.BookingID = b.BookingID
                WHERE b.MemberID = ? LIMIT 1
            `;
            db.query(findPaymentSql, [MemberID], (err, payments) => {
                if (err || payments.length === 0) {
                    return res.status(201).json({ message: 'แลกรางวัลสำเร็จ (ไม่มี PaymentID บันทึกแต้ม)' });
                }
                const insertPointsSql = 'INSERT INTO POINT_TRANSACTION (PointsEarned, PointsRedeemed, Date, PaymentID) VALUES (0, ?, ?, ?)';
                db.query(insertPointsSql, [PointsUsed, RedemptionDate || new Date(), payments[0].PaymentID], (err) => {
                    if (err) return res.status(500).json(err);
                    res.status(201).json({ message: 'แลกรางวัลสำเร็จ', RedemptionID: result.insertId });
                });
            });
        });
    });
};

// ประวัติการแลกรางวัลของสมาชิก
exports.getMemberRedemptions = (req, res) => {
    const sql = `
        SELECT r.*, rw.Name AS RewardName, rw.Category
        FROM REDEMPTION r
        JOIN REWARD_ITEM rw ON r.RewardID = rw.RewardID
        WHERE r.MemberID = ?
        ORDER BY r.RedemptionDate DESC
    `;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};