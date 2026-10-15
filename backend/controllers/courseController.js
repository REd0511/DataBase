const db = require('../config/db');

// ============================================
// 1. READ: ดึงคอร์สทั้งหมด
// ============================================
exports.getAllCourses = (req, res) => {
    const sql = `
        SELECT c.*, s.SportName, cp.PrerequisiteCourseID
        FROM COURSE c
        JOIN SPORT_TYPE s ON c.SportTypeID = s.SportTypeID
        LEFT JOIN COURSE_PREREQUISITE cp ON c.CourseID = cp.CourseID
        GROUP BY c.CourseID
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// ============================================
// 2. CREATE: เพิ่มคอร์สใหม่
// ============================================
exports.createCourse = (req, res) => {
    const { Title, Level, DurationHours, StandardFee, SportTypeID, StudioCode, RoomID, TrainerID, PrerequisiteCourseID, ImageURL } = req.body;

    if (!Title || !DurationHours || !StandardFee || !SportTypeID) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
    }

    const insertSql = `
        INSERT INTO COURSE (Title, Level, DurationHours, StandardFee, SportTypeID, StudioCode, RoomID, TrainerID, ImageURL)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        Title, Level || 'Beginner', DurationHours, StandardFee, SportTypeID,
        StudioCode || null, RoomID || null, TrainerID || null, ImageURL || null
    ];

    db.query(insertSql, values, (err, result) => {
        if (err) return res.status(500).json(err);

        const newCourseId = result.insertId;

        if (PrerequisiteCourseID) {
            const prereqSql = 'INSERT INTO COURSE_PREREQUISITE (CourseID, PrerequisiteCourseID) VALUES (?, ?)';
            db.query(prereqSql, [newCourseId, PrerequisiteCourseID], (prereqErr) => {
                if (prereqErr) return res.status(500).json(prereqErr);
                return res.status(201).json({ message: 'สร้างคอร์สและวิชาบังคับก่อนสำเร็จ', CourseID: newCourseId });
            });
        } else {
            res.status(201).json({ message: 'สร้างคอร์สสำเร็จ', CourseID: newCourseId });
        }
    });
};

// ============================================
// 3. UPDATE
// ============================================
exports.updateCourse = (req, res) => {
    const courseId = req.params.id;
    const { Title, Level, DurationHours, StandardFee, SportTypeID, StudioCode, RoomID, TrainerID, PrerequisiteCourseID, ImageURL } = req.body;

    const updateSql = `
        UPDATE COURSE 
        SET Title=?, Level=?, DurationHours=?, StandardFee=?, SportTypeID=?, StudioCode=?, RoomID=?, TrainerID=?, ImageURL=?
        WHERE CourseID=?
    `;

    const values = [
        Title, Level, DurationHours, StandardFee, SportTypeID,
        StudioCode || null, RoomID || null, TrainerID || null, ImageURL || null,
        courseId
    ];

    db.query(updateSql, values, (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'ไม่พบคอร์สนี้' });

        db.query('DELETE FROM COURSE_PREREQUISITE WHERE CourseID=?', [courseId], (delErr) => {
            if (delErr) return res.status(500).json(delErr);

            if (PrerequisiteCourseID) {
                db.query('INSERT INTO COURSE_PREREQUISITE (CourseID, PrerequisiteCourseID) VALUES (?, ?)', [courseId, PrerequisiteCourseID], (inErr) => {
                    if (inErr) return res.status(500).json(inErr);
                    return res.json({ message: 'อัปเดตคอร์สสำเร็จ' });
                });
            } else {
                res.json({ message: 'อัปเดตคอร์สสำเร็จ' });
            }
        });
    });
};

// ============================================
// 4. DELETE
// ============================================
exports.deleteCourse = (req, res) => {
    const courseId = req.params.id;

    // ลบ Payment ที่ผูกกับ Enrollment ของ Course นี้ก่อน
    db.query(
        `DELETE FROM POINT_TRANSACTION 
         WHERE PaymentID IN (
            SELECT PaymentID FROM PAYMENT WHERE EnrollmentID IN (
                SELECT EnrollmentID FROM ENROLLMENT WHERE CourseID = ?
            )
         )`,
        [courseId],
        (errPoint) => {
            if (errPoint) return res.status(500).json(errPoint);

            db.query(
                `DELETE FROM PAYMENT WHERE EnrollmentID IN (
                    SELECT EnrollmentID FROM ENROLLMENT WHERE CourseID = ?
                )`,
                [courseId],
                (errPay) => {
                    if (errPay) return res.status(500).json(errPay);

                    db.query('DELETE FROM ENROLLMENT WHERE CourseID = ?', [courseId], (err1) => {
                        if (err1) return res.status(500).json(err1);

                        db.query('DELETE FROM COURSE_PREREQUISITE WHERE CourseID = ? OR PrerequisiteCourseID = ?', [courseId, courseId], (err2) => {
                            if (err2) return res.status(500).json(err2);

                            db.query('DELETE FROM COURSE WHERE CourseID = ?', [courseId], (err3, result) => {
                                if (err3) return res.status(500).json(err3);
                                if (result.affectedRows === 0) return res.status(404).json({ message: 'ไม่พบคอร์สนี้' });
                                res.json({ message: 'ลบคอร์สสำเร็จ' });
                            });
                        });
                    });
                }
            );
        }
    );
};

// ============================================
// 5. ENROLL COURSE (✅ ได้แต้ม! 1 บาท = 1 แต้ม + ผูก EnrollmentID ใน Payment)
// ============================================
exports.enrollCourse = (req, res) => {
    const { MemberID, CourseID, EnrollmentDate, PaymentStatus } = req.body;
    if (!MemberID || !CourseID || !EnrollmentDate) {
        return res.status(400).json({ message: 'กรอกข้อมูลให้ครบ' });
    }

    // 1. ดึงข้อมูลคอร์ส
    const courseSql = 'SELECT CourseID, Title, StandardFee FROM COURSE WHERE CourseID = ?';
    db.query(courseSql, [CourseID], (err, courseRows) => {
        if (err) return res.status(500).json(err);
        if (courseRows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบคอร์สนี้' });
        }

        const course = courseRows[0];
        const fee = Number(course.StandardFee || 0);
        const pointsEarned = Math.floor(fee);
        const status = PaymentStatus || 'PAID';

        // 2. INSERT ENROLLMENT
        const enrollSql = `
            INSERT INTO ENROLLMENT (MemberID, CourseID, EnrollmentDate, PaymentStatus) 
            VALUES (?, ?, ?, ?)
        `;
        db.query(enrollSql, [MemberID, CourseID, EnrollmentDate, status], (err2, enrollResult) => {
            if (err2) {
                if (err2.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'ลงทะเบียนคอร์สนี้แล้ว' });
                }
                return res.status(500).json(err2);
            }

            const enrollmentId = enrollResult.insertId;

            // 3. ถ้าจ่ายเงิน → สร้าง Payment + PointTransaction
            if (status === 'PAID' && pointsEarned > 0) {
                const paymentSql = `
                    INSERT INTO PAYMENT (Amount, PaymentDate, PaymentMethod, PaymentStatus, BookingID, RedemptionID, EnrollmentID)
                    VALUES (?, NOW(), 'Course Enrollment', 'PAID', NULL, NULL, ?)
                `;
                db.query(paymentSql, [fee, enrollmentId], (err3, paymentResult) => {
                    if (err3) {
                        console.warn('Cannot create payment for course:', err3.message);
                        return res.status(201).json({
                            message: 'ลงทะเบียนสำเร็จ (ไม่ได้แต้ม - Payment error)',
                            EnrollmentID: enrollmentId,
                            PointsEarned: 0,
                        });
                    }

                    const paymentId = paymentResult.insertId;

                    // 4. INSERT POINT_TRANSACTION
                    const pointsSql = `
                        INSERT INTO POINT_TRANSACTION (MemberID, PaymentID, PointsChange, Reason, TransactionDate)
                        VALUES (?, ?, ?, 'EARN_FROM_COURSE', NOW())
                    `;
                    db.query(pointsSql, [MemberID, paymentId, pointsEarned], (err4) => {
                        if (err4) {
                            console.warn('Cannot create point transaction:', err4.message);
                            return res.status(201).json({
                                message: 'ลงทะเบียนสำเร็จ (Point error)',
                                EnrollmentID: enrollmentId,
                                PointsEarned: 0,
                            });
                        }

                        res.status(201).json({
                            message: 'ลงทะเบียนสำเร็จ ได้รับแต้มแล้ว!',
                            EnrollmentID: enrollmentId,
                            PointsEarned: pointsEarned,
                            PaymentID: paymentId,
                        });
                    });
                });
            } else {
                res.status(201).json({
                    message: 'ลงทะเบียนสำเร็จ (รอชำระเงิน - ยังไม่ได้แต้ม)',
                    EnrollmentID: enrollmentId,
                    PointsEarned: 0,
                });
            }
        });
    });
};

// ============================================
// 6. GET MEMBER ENROLLMENTS
// ============================================
exports.getMemberEnrollments = (req, res) => {
    const sql = `
        SELECT 
            e.EnrollmentID,
            e.MemberID,
            e.CourseID,
            e.EnrollmentDate,
            e.PaymentStatus,
            c.Title,
            c.Level,
            c.DurationHours,
            c.StandardFee,
            c.ImageURL,
            p.PaymentID,
            p.Amount,
            p.PaymentStatus AS PaymentStatusDetail
        FROM ENROLLMENT e
        JOIN COURSE c ON e.CourseID = c.CourseID
        LEFT JOIN PAYMENT p ON p.EnrollmentID = e.EnrollmentID
        WHERE e.MemberID = ?
        ORDER BY e.EnrollmentDate DESC
    `;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};