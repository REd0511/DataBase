const db = require('../config/db');

// ============================================
// CREATE BOOKING (ตรวจสอบ + INSERT ครบ)
// ============================================
exports.createBooking = async (req, res) => {
  const {
    BookingDate,
    StartTime,
    EndTime,
    MemberID,
    RoomID,
    EquipmentIDs,
    TrainerIDs,
  } = req.body;

  // 1. Validation
  if (!BookingDate || !StartTime || !EndTime || !MemberID || !RoomID) {
    return res.status(400).json({ message: 'กรอกข้อมูลให้ครบ' });
  }

  const today = new Date().toISOString().split('T')[0];
  if (BookingDate < today) {
    return res.status(400).json({ message: 'ไม่สามารถจองย้อนหลังได้' });
  }

  try {
    // 2. ตรวจสอบห้องว่าง
    const [overlap] = await db.promise().query(
      `SELECT BookingID FROM BOOKING 
       WHERE RoomID = ? AND BookingDate = ? 
       AND StartTime < ? AND EndTime > ?`,
      [RoomID, BookingDate, EndTime, StartTime],
    );

    if (overlap.length > 0) {
      return res.status(400).json({ message: 'ห้องถูกจองแล้วในช่วงเวลานี้' });
    }

    // 3. INSERT BOOKING
    const [bookingResult] = await db.promise().query(
      `INSERT INTO BOOKING (BookingDate, StartTime, EndTime, MemberID, RoomID) 
       VALUES (?, ?, ?, ?, ?)`,
      [BookingDate, StartTime, EndTime, MemberID, RoomID],
    );

    const bookingId = bookingResult.insertId;

    // 4. INSERT EQUIPMENT (ถ้ามี) — ใช้ await
    if (EquipmentIDs && EquipmentIDs.length > 0) {
      const equipValues = EquipmentIDs.map((eq) => [
        bookingId,
        eq.EquipmentID || eq,
        eq.Quantity || 1,
        'Not Returned',
      ]);
      await db.promise().query(
        `INSERT INTO BOOKING_EQUIPMENT 
         (BookingID, EquipmentID, Quantity, ReturnStatus) VALUES ?`,
        [equipValues],
      );
    }

    // 5. INSERT TRAINER (ถ้ามี) — ใช้ await
    if (TrainerIDs && TrainerIDs.length > 0) {
      const trainerValues = TrainerIDs.map((t) => [
        bookingId,
        t.TrainerID || t,
        t.TrainerRole || 'Main Trainer',
        t.HourlyRate || 500,
      ]);
      await db.promise().query(
        `INSERT INTO BOOKING_TRAINER 
         (BookingID, TrainerID, TrainerRole, HourlyRateAtBooking) VALUES ?`,
        [trainerValues],
      );
    }

    // 6. ส่ง Response หลัง INSERT เสร็จหมด
    res.status(201).json({
      message: 'จองสำเร็จ',
      BookingID: bookingId,
    });
  } catch (err) {
    console.error('createBooking error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================
// GET MEMBER BOOKINGS (JOIN ครบ)
// ============================================
exports.getMemberBookings = async (req, res) => {
  try {
    const memberId = req.params.id;

    const [bookings] = await db.promise().query(
      `SELECT 
        b.BookingID,
        b.BookingDate,
        b.StartTime,
        b.EndTime,
        b.MemberID,
        b.RoomID,
        r.RoomName,
        r.Capacity,
        s.StudioCode,
        s.Name AS StudioName,
        s.Location,
        st.SportTypeID,
        st.SportName,
        (SELECT GROUP_CONCAT(t.Name SEPARATOR ', ') 
         FROM BOOKING_TRAINER bt 
         JOIN TRAINER t ON t.TrainerID = bt.TrainerID 
         WHERE bt.BookingID = b.BookingID) AS TrainerName,
        (SELECT GROUP_CONCAT(e.Name SEPARATOR ', ') 
         FROM BOOKING_EQUIPMENT be 
         JOIN EQUIPMENT e ON e.EquipmentID = be.EquipmentID 
         WHERE be.BookingID = b.BookingID) AS EquipmentNames,
        p.PaymentID,
        p.Amount,
        p.PaymentStatus
       FROM BOOKING b
       JOIN ROOM r ON r.RoomID = b.RoomID
       JOIN STUDIO s ON s.StudioCode = r.StudioCode
       LEFT JOIN SPORT_TYPE st ON st.SportTypeID = r.SportTypeID
       LEFT JOIN PAYMENT p ON p.BookingID = b.BookingID
       WHERE b.MemberID = ?
       ORDER BY b.BookingDate DESC, b.StartTime DESC`,
      [memberId],
    );

    // เพิ่ม Points + Status
    const enrichedBookings = bookings.map((b) => ({
      ...b,
      Points: Math.floor(Number(b.Amount || 0)),
      Status: b.PaymentStatus === 'Paid' ? 'Confirmed' : 'Pending',
      Equipments: b.EquipmentNames
        ? b.EquipmentNames.split(', ').map((name) => ({ Name: name }))
        : [],
    }));

    res.json(enrichedBookings);
  } catch (err) {
    console.error('getMemberBookings error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================
// GET ALL BOOKINGS (Admin/Manager)
// ============================================
exports.getAllBookings = async (req, res) => {
  try {
    const [bookings] = await db.promise().query(
      `SELECT 
        b.BookingID,
        b.BookingDate,
        b.StartTime,
        b.EndTime,
        b.MemberID,
        b.RoomID,
        m.Name AS MemberName,
        r.RoomName,
        r.Capacity,
        s.Name AS StudioName,
        s.Location,
        st.SportName,
        (SELECT GROUP_CONCAT(t.Name SEPARATOR ', ') 
         FROM BOOKING_TRAINER bt 
         JOIN TRAINER t ON t.TrainerID = bt.TrainerID 
         WHERE bt.BookingID = b.BookingID) AS TrainerName,
        (SELECT GROUP_CONCAT(e.Name SEPARATOR ', ') 
         FROM BOOKING_EQUIPMENT be 
         JOIN EQUIPMENT e ON e.EquipmentID = be.EquipmentID 
         WHERE be.BookingID = b.BookingID) AS EquipmentNames,
        p.PaymentID,
        p.Amount,
        p.PaymentStatus
       FROM BOOKING b
       JOIN MEMBER m ON m.MemberID = b.MemberID
       JOIN ROOM r ON r.RoomID = b.RoomID
       JOIN STUDIO s ON s.StudioCode = r.StudioCode
       LEFT JOIN SPORT_TYPE st ON st.SportTypeID = r.SportTypeID
       LEFT JOIN PAYMENT p ON p.BookingID = b.BookingID
       ORDER BY b.BookingDate DESC, b.StartTime DESC`,
    );

    const enrichedBookings = bookings.map((b) => ({
      ...b,
      Points: Math.floor(Number(b.Amount || 0)),
      Status: b.PaymentStatus === 'Paid' ? 'Confirmed' : 'Pending',
      Equipments: b.EquipmentNames
        ? b.EquipmentNames.split(', ').map((name) => ({ Name: name }))
        : [],
    }));

    res.json(enrichedBookings);
  } catch (err) {
    console.error('getAllBookings error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================
// GET BOOKED SLOTS (สำหรับ Room Modal)
// ============================================
exports.getBookedSlots = async (req, res) => {
  try {
    const { roomId } = req.params;

    const [bookings] = await db.promise().query(
      `SELECT BookingDate, StartTime, EndTime 
       FROM BOOKING 
       WHERE RoomID = ? 
       AND BookingDate >= CURDATE()
       ORDER BY BookingDate, StartTime`,
      [roomId],
    );

    res.json(bookings);
  } catch (err) {
    console.error('getBookedSlots error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================
// CANCEL BOOKING
// ============================================
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // ลบ Equipment ก่อน (FK)
    await db.promise().query('DELETE FROM BOOKING_EQUIPMENT WHERE BookingID = ?', [
      bookingId,
    ]);

    // ลบ Trainer (FK)
    await db.promise().query('DELETE FROM BOOKING_TRAINER WHERE BookingID = ?', [
      bookingId,
    ]);

    // ลบ Payment (FK)
    await db.promise().query('DELETE FROM PAYMENT WHERE BookingID = ?', [
      bookingId,
    ]);

    // ลบ Booking
    const [result] = await db.promise().query(
      'DELETE FROM BOOKING WHERE BookingID = ?',
      [bookingId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบการจอง' });
    }

    res.json({ message: 'ยกเลิกการจองสำเร็จ' });
  } catch (err) {
    console.error('cancelBooking error:', err);
    res.status(500).json({ error: err.message });
  }
};