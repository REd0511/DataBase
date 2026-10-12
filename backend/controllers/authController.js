const db = require('../config/db');

// Login (แบบง่าย ไม่มี hash password เพราะเป็นโปรเจกต์การศึกษา)
exports.login = (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'กรุณากรอกเบอร์โทร' });

    const sql = 'SELECT * FROM MEMBER WHERE Phone = ?';
    db.query(sql, [phone], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) {
            return res.status(401).json({ message: 'ไม่พบสมาชิกนี้ในระบบ' });
        }
        res.json({ message: 'เข้าสู่ระบบสำเร็จ', member: results[0] });
    });
};