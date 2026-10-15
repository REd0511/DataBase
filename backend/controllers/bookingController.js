const db = require('../config/db');

// ============================================
// CREATE BOOKING  1 baht = 1 point
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

  if (!BookingDate || !StartTime || !EndTime || !MemberID || !RoomID) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  const today = new Date().toISOString().split('T')[0];
  if (BookingDate < today) {
    return res.status(400).json({ message: 'Cannot book in the past' });
  }

  try {
    // 1. Get room rate
    const [roomRows] = await db.promise().query(
      `SELECT HourlyRate, TrainerRate FROM ROOM WHERE RoomID = ?`,
      [RoomID]
    );
    if (roomRows.length === 0) {
      return res.status(400).json({ message: 'Room not found' });
    }
    const hourlyRate = Number(roomRows[0].HourlyRate || 200);
    const trainerRate = Number(roomRows[0].TrainerRate || 500);

    // 2. Calculate hours
    const startH = parseInt(StartTime.split(':')[0]);
    const startM = parseInt(StartTime.split(':')[1] || '0');
    const endH = parseInt(EndTime.split(':')[0]);
    const endM = parseInt(EndTime.split(':')[1] || '0');
    const hours = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;

    if (hours <= 0) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // 3. Check room overlap
    const [overlap] = await db.promise().query(
      `SELECT BookingID FROM BOOKING 
       WHERE RoomID = ? AND BookingDate = ? 
       AND StartTime < ? AND EndTime > ?`,
      [RoomID, BookingDate, EndTime, StartTime]
    );
    if (overlap.length > 0) {
      return res.status(400).json({ message: 'Room is already booked during this time' });
    }

    // 4. Calculate total price
    let amount = hours * hourlyRate;
    if (TrainerIDs && TrainerIDs.length > 0) {
      amount += hours * trainerRate * TrainerIDs.length;
    }

    // 5. INSERT BOOKING
    const [bookingResult] = await db.promise().query(
      `INSERT INTO BOOKING (BookingDate, StartTime, EndTime, MemberID, RoomID) 
       VALUES (?, ?, ?, ?, ?)`,
      [BookingDate, StartTime, EndTime, MemberID, RoomID]
    );
    const bookingId = bookingResult.insertId;

    // 6. INSERT EQUIPMENT
    if (EquipmentIDs && EquipmentIDs.length > 0) {
      const equipValues = EquipmentIDs.map((eq) => [
        bookingId,
        eq.EquipmentID || eq,
        eq.Quantity || 1,
        'NOT_ISSUED',
      ]);
      await db.promise().query(
        `INSERT INTO BOOKING_EQUIPMENT (BookingID, EquipmentID, Quantity, ReturnStatus) VALUES ?`,
        [equipValues]
      );
    }

    // 7. INSERT TRAINER
    if (TrainerIDs && TrainerIDs.length > 0) {
      const trainerValues = TrainerIDs.map((t) => [
        bookingId,
        t.TrainerID || t,
        t.TrainerRole || 'Main Trainer',
        trainerRate,
      ]);
      await db.promise().query(
        `INSERT INTO BOOKING_TRAINER (BookingID, TrainerID, TrainerRole, HourlyRateAtBooking) VALUES ?`,
        [trainerValues]
      );
    }

    // 8. INSERT PAYMENT
    const [paymentResult] = await db.promise().query(
      `INSERT INTO PAYMENT (Amount, PaymentDate, PaymentMethod, PaymentStatus, BookingID, RedemptionID, EnrollmentID) 
       VALUES (?, NOW(), 'Pending', 'UNPAID', ?, NULL, NULL)`,
      [amount, bookingId]
    );
    const paymentId = paymentResult.insertId;

    // 9. INSERT POINT_TRANSACTION
    const earnedPoints = Math.floor(amount);
    if (earnedPoints > 0) {
      await db.promise().query(
        `INSERT INTO POINT_TRANSACTION (MemberID, PaymentID, PointsChange, Reason, TransactionDate)
         VALUES (?, ?, ?, 'EARN_FROM_BOOKING', NOW())`,
        [MemberID, paymentId, earnedPoints]
      );
    }

    res.status(201).json({
      message: 'Booking successful',
      BookingID: bookingId,
      PaymentID: paymentId,
      Amount: amount,
      PointsEarned: earnedPoints,
      Hours: hours,
      HourlyRate: hourlyRate,
    });

  } catch (err) {
    console.error('createBooking error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================
// GET BOOKING PREVIEW
// ============================================
exports.getBookingPreview = async (req, res) => {
  const { RoomID, StartTime, EndTime, TrainerCount } = req.query;

  if (!RoomID || !StartTime || !EndTime) {
    return res.status(400).json({ message: 'Please specify RoomID, StartTime, EndTime' });
  }

  try {
    const [roomRows] = await db.promise().query(
      `SELECT HourlyRate, TrainerRate FROM ROOM WHERE RoomID = ?`,
      [RoomID]
    );
    if (roomRows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const hourlyRate = Number(roomRows[0].HourlyRate || 200);
    const trainerRate = Number(roomRows[0].TrainerRate || 500);

    const startH = parseInt(StartTime.split(':')[0]);
    const startM = parseInt(StartTime.split(':')[1] || '0');
    const endH = parseInt(EndTime.split(':')[0]);
    const endM = parseInt(EndTime.split(':')[1] || '0');
    const hours = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;

    const trainerCount = parseInt(TrainerCount || '0');
    let amount = hours * hourlyRate;
    if (trainerCount > 0) {
      amount += hours * trainerRate * trainerCount;
    }

    res.json({
      Hours: hours,
      HourlyRate: hourlyRate,
      TrainerRate: trainerRate,
      TrainerCount: trainerCount,
      Amount: amount,
      PointsEarned: Math.floor(amount),
    });
  } catch (err) {
    console.error('getBookingPreview error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================
// GET MEMBER BOOKINGS (with CreatedAt)
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
        b.CreatedAt,
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
        (SELECT GROUP_CONCAT(CONCAT(e.Name, ' (x', be.Quantity, ')') SEPARATOR ', ') 
         FROM BOOKING_EQUIPMENT be 
         JOIN EQUIPMENT e ON e.EquipmentID = be.EquipmentID 
         WHERE be.BookingID = b.BookingID) AS EquipmentNames,
        p.PaymentID,
        p.Amount,
        p.PaymentDate,
        p.PaymentStatus,
        (SELECT SUM(pt.PointsChange) FROM POINT_TRANSACTION pt 
         WHERE pt.PaymentID = p.PaymentID AND pt.PointsChange > 0) AS EarnedPoints
       FROM BOOKING b
       JOIN ROOM r ON r.RoomID = b.RoomID
       JOIN STUDIO s ON s.StudioCode = r.StudioCode
       LEFT JOIN SPORT_TYPE st ON st.SportTypeID = r.SportTypeID
       LEFT JOIN PAYMENT p ON p.BookingID = b.BookingID
       WHERE b.MemberID = ?
       ORDER BY b.CreatedAt DESC, b.BookingID DESC`,
      [memberId]
    );

    const enrichedBookings = bookings.map((b) => ({
      ...b,
      Points: Math.floor(Number(b.EarnedPoints || 0)),
      Status: b.PaymentStatus === 'PAID' ? 'Confirmed' : 'Pending',
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
        b.CreatedAt,
        b.MemberID,
        b.RoomID,
        m.Name AS MemberName,
        r.RoomName,
        r.Capacity,
        s.StudioCode,
        s.Name AS StudioName,
        s.Location,
        st.SportName,
        (SELECT GROUP_CONCAT(t.Name SEPARATOR ', ') 
         FROM BOOKING_TRAINER bt 
         JOIN TRAINER t ON t.TrainerID = bt.TrainerID 
         WHERE bt.BookingID = b.BookingID) AS TrainerName,
        (SELECT GROUP_CONCAT(CONCAT(e.Name, ' (x', be.Quantity, ')') SEPARATOR ', ') 
         FROM BOOKING_EQUIPMENT be 
         JOIN EQUIPMENT e ON e.EquipmentID = be.EquipmentID 
         WHERE be.BookingID = b.BookingID) AS EquipmentNames,
        p.PaymentID,
        p.Amount,
        p.PaymentDate,
        p.PaymentStatus,
        (SELECT SUM(pt.PointsChange) FROM POINT_TRANSACTION pt 
         WHERE pt.PaymentID = p.PaymentID AND pt.PointsChange > 0) AS EarnedPoints
       FROM BOOKING b
       JOIN MEMBER m ON m.MemberID = b.MemberID
       JOIN ROOM r ON r.RoomID = b.RoomID
       JOIN STUDIO s ON s.StudioCode = r.StudioCode
       LEFT JOIN SPORT_TYPE st ON st.SportTypeID = r.SportTypeID
       LEFT JOIN PAYMENT p ON p.BookingID = b.BookingID
       ORDER BY b.CreatedAt DESC, b.BookingID DESC`
    );

    const enrichedBookings = bookings.map((b) => ({
      ...b,
      Points: Math.floor(Number(b.EarnedPoints || 0)),
      Status: b.PaymentStatus === 'PAID' ? 'Confirmed' : 'Pending',
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
// GET BOOKED SLOTS
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
      [roomId]
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

    // 1. Get PaymentID for this Booking
    const [payments] = await db.promise().query(
      'SELECT PaymentID FROM PAYMENT WHERE BookingID = ?',
      [bookingId]
    );

    // 2. Get points earned from this Booking
    let pointsEarned = 0;
    if (payments.length > 0) {
      const [points] = await db.promise().query(
        `SELECT COALESCE(SUM(PointsChange), 0) AS Total
         FROM POINT_TRANSACTION
         WHERE PaymentID = ? AND PointsChange > 0`,
        [payments[0].PaymentID]
      );
      pointsEarned = Number(points[0].Total || 0);
    }

    // 3. Check if enough points to deduct back
    const [booking] = await db.promise().query(
      'SELECT MemberID FROM BOOKING WHERE BookingID = ?',
      [bookingId]
    );

    if (booking.length > 0 && pointsEarned > 0) {
      const memberId = booking[0].MemberID;
      const [balanceRows] = await db.promise().query(
        `SELECT COALESCE(SUM(PointsChange), 0) AS Balance
         FROM POINT_TRANSACTION WHERE MemberID = ?`,
        [memberId]
      );
      const currentBalance = Number(balanceRows[0].Balance || 0);

      if (currentBalance - pointsEarned < 0) {
        return res.status(400).json({
          message: `Cannot cancel because points have already been used (Balance: ${currentBalance}, Points to deduct: ${pointsEarned})`
        });
      }
    }

    // 4. Delete related records in order
    await db.promise().query(
      `DELETE FROM POINT_TRANSACTION 
       WHERE PaymentID IN (SELECT PaymentID FROM PAYMENT WHERE BookingID = ?)`,
      [bookingId]
    );
    await db.promise().query('DELETE FROM BOOKING_EQUIPMENT WHERE BookingID = ?', [bookingId]);
    await db.promise().query('DELETE FROM BOOKING_TRAINER WHERE BookingID = ?', [bookingId]);
    await db.promise().query('DELETE FROM PAYMENT WHERE BookingID = ?', [bookingId]);

    const [result] = await db.promise().query('DELETE FROM BOOKING WHERE BookingID = ?', [bookingId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('cancelBooking error:', err);
    res.status(500).json({ error: err.message });
  }
};