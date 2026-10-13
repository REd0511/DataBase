const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db'); // เชื่อมต่อ DB ทันที

const app = express();
app.use(cors());
// Serve the frontend from the same origin so pages can call /api/... directly.
app.use(express.static(require('path').join(__dirname, '../frontend')));
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const roomRoutes = require('./routes/roomRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const courseRoutes = require('./routes/courseRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api', roomRoutes);          // → /api/studios, /api/rooms, /api/sports
app.use('/api/trainers', trainerRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/reports', reportRoutes);


// หน้าแรก
app.get('/', (req, res) => {
    res.send('<h1>SheSparks Wellness API 🎉</h1><p>Server is running!</p>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});