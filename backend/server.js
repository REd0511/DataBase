const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shesparks',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

db.query('SELECT 1', (err) => {
  if (err) console.error('❌ MySQL connection failed:', err.message);
  else console.log('✅ Connected to MySQL database!');
});

function query(sql, params = []) { return new Promise((resolve,reject)=>db.query(sql,params,(e,r)=>e?reject(e):resolve(r))); }
function sendDbError(res, err) { console.error(err); res.status(500).json({ error: err.message }); }

app.get('/', (req,res)=>res.sendFile(path.join(__dirname,'../frontend/views/index.html')));
app.get('/views/:page', (req,res)=>res.sendFile(path.join(__dirname,'../frontend/views',req.params.page)));

// Existing CRUD/read endpoints
app.get('/api/members', async (req,res)=>{ try{res.json(await query('SELECT * FROM MEMBER ORDER BY MemberID'));}catch(e){sendDbError(res,e);} });
app.get('/api/studios', async (req,res)=>{ try{res.json(await query('SELECT * FROM STUDIO ORDER BY StudioCode'));}catch(e){sendDbError(res,e);} });
app.get('/api/rooms', async (req,res)=>{ try{res.json(await query('SELECT r.*,s.Location FROM ROOM r JOIN STUDIO s ON s.StudioCode=r.StudioCode ORDER BY r.RoomID'));}catch(e){sendDbError(res,e);} });
app.get('/api/trainers', async (req,res)=>{ try{res.json(await query('SELECT t.*,st.SportName,s.Location FROM TRAINER t JOIN SPORT_TYPE st ON st.SportTypeID=t.SportTypeID JOIN STUDIO s ON s.StudioCode=t.StudioCode ORDER BY t.TrainerID'));}catch(e){sendDbError(res,e);} });
app.get('/api/courses', async (req,res)=>{ try{res.json(await query('SELECT c.*,st.SportName FROM COURSE c JOIN SPORT_TYPE st ON st.SportTypeID=c.SportTypeID ORDER BY c.CourseID'));}catch(e){sendDbError(res,e);} });
app.get('/api/equipments', async (req,res)=>{ try{res.json(await query('SELECT e.*,st.SportName FROM EQUIPMENT e LEFT JOIN SPORT_TYPE st ON st.SportTypeID=e.SportTypeID ORDER BY e.EquipmentID'));}catch(e){sendDbError(res,e);} });
app.get('/api/rewards', async (req,res)=>{ try{res.json(await query('SELECT * FROM REWARD_ITEM ORDER BY PointCost'));}catch(e){sendDbError(res,e);} });

app.get('/api/members/:id/points', async (req,res)=>{
  try { const rows=await query(`SELECT m.MemberID,m.Name,COALESCE(SUM(pt.PointsEarned),0) Earned,COALESCE(SUM(pt.PointsRedeemed),0) Redeemed,COALESCE(SUM(pt.PointsEarned-pt.PointsRedeemed),0) Balance
  FROM MEMBER m LEFT JOIN BOOKING b ON b.MemberID=m.MemberID LEFT JOIN PAYMENT p ON p.BookingID=b.BookingID LEFT JOIN POINT_TRANSACTION pt ON pt.PaymentID=p.PaymentID
  WHERE m.MemberID=? GROUP BY m.MemberID,m.Name`,[req.params.id]); if(!rows.length)return res.status(404).json({message:'Member not found'}); res.json(rows[0]); }
  catch(e){sendDbError(res,e);}
});

// Booking / payment / enrollment / redemption
app.post('/api/bookings', async (req,res)=>{
  try {
    const {BookingDate,StartTime,EndTime,MemberID,RoomID}=req.body;
    if(!BookingDate||!StartTime||!EndTime||!MemberID||!RoomID)return res.status(400).json({message:'กรุณากรอกข้อมูลให้ครบถ้วน'});
    if(BookingDate < new Date().toISOString().slice(0,10))return res.status(400).json({message:'ไม่สามารถจองย้อนหลังได้'});
    const overlap=await query(`SELECT BookingID FROM BOOKING WHERE RoomID=? AND BookingDate=? AND StartTime<? AND EndTime>?`,[RoomID,BookingDate,EndTime,StartTime]);
    if(overlap.length)return res.status(409).json({message:'ห้องนี้ถูกจองไปแล้วในช่วงเวลาดังกล่าว'});
    const result=await query('INSERT INTO BOOKING (BookingDate,StartTime,EndTime,MemberID,RoomID) VALUES (?,?,?,?,?)',[BookingDate,StartTime,EndTime,MemberID,RoomID]);
    res.status(201).json({message:'จองห้องสำเร็จ',BookingID:result.insertId});
  } catch(e){sendDbError(res,e);}
});

app.post('/api/payments', async (req,res)=>{
  const conn=await new Promise((resolve,reject)=>db.getConnection((e,c)=>e?reject(e):resolve(c))).catch(e=>null);
  if(!conn)return res.status(500).json({error:'Database connection unavailable'});
  try{
    const {Amount,PaymentDate,PaymentMethod,BookingID}=req.body;
    if(Amount==null||!PaymentDate||!PaymentMethod||!BookingID)return res.status(400).json({message:'กรุณากรอกข้อมูลให้ครบถ้วน'});
    await conn.promise().beginTransaction();
    const [p]=await conn.promise().query('INSERT INTO PAYMENT (Amount,PaymentDate,PaymentMethod,BookingID) VALUES (?,?,?,?)',[Amount,PaymentDate,PaymentMethod,BookingID]);
    const points=Math.floor(Number(Amount));
    await conn.promise().query('INSERT INTO POINT_TRANSACTION (PointsEarned,PointsRedeemed,`Date`,PaymentID) VALUES (?,0,?,?)',[points,PaymentDate,p.insertId]);
    await conn.promise().commit();
    res.status(201).json({message:'ชำระเงินสำเร็จ',PaymentID:p.insertId,PointsEarned:points});
  }catch(e){try{await conn.promise().rollback();}catch{} sendDbError(res,e);}finally{conn.release();}
});

app.post('/api/enrollments', async (req,res)=>{try{const {MemberID,CourseID,EnrollmentDate,PaymentStatus}=req.body;if(!MemberID||!CourseID||!EnrollmentDate)return res.status(400).json({message:'กรุณากรอกข้อมูลให้ครบถ้วน'});await query('INSERT INTO ENROLLMENT (MemberID,CourseID,EnrollmentDate,PaymentStatus) VALUES (?,?,?,?)',[MemberID,CourseID,EnrollmentDate,PaymentStatus||'Pending']);res.status(201).json({message:'ลงทะเบียนสำเร็จ'});}catch(e){if(e.code==='ER_DUP_ENTRY')return res.status(409).json({message:'สมาชิกคนนี้ลงทะเบียนคอร์สนี้แล้ว'});sendDbError(res,e);}});

app.post('/api/redemptions', async (req,res)=>{try{
  const {MemberID,RewardID,RedemptionDate}=req.body; if(!MemberID||!RewardID||!RedemptionDate)return res.status(400).json({message:'กรุณากรอกข้อมูลให้ครบถ้วน'});
  const reward=(await query('SELECT * FROM REWARD_ITEM WHERE RewardID=?',[RewardID]))[0]; if(!reward)return res.status(404).json({message:'Reward not found'});
  const balance=(await query(`SELECT COALESCE(SUM(pt.PointsEarned-pt.PointsRedeemed),0) Balance FROM MEMBER m LEFT JOIN BOOKING b ON b.MemberID=m.MemberID LEFT JOIN PAYMENT p ON p.BookingID=b.BookingID LEFT JOIN POINT_TRANSACTION pt ON pt.PaymentID=p.PaymentID WHERE m.MemberID=?`,[MemberID]))[0].Balance;
  if(balance<reward.PointCost)return res.status(400).json({message:`แต้มไม่เพียงพอ (มี ${balance} แต้ม, ต้องใช้ ${reward.PointCost} แต้ม)`});
  const payment=(await query('SELECT p.PaymentID FROM PAYMENT p JOIN BOOKING b ON b.BookingID=p.BookingID WHERE b.MemberID=? ORDER BY p.PaymentDate DESC LIMIT 1',[MemberID]))[0];
  if(!payment)return res.status(400).json({message:'ต้องมีประวัติการชำระเงินก่อนจึงจะบันทึก PointTransaction ได้'});
  await query('INSERT INTO REDEMPTION (MemberID,RewardID,RedemptionDate,PointsUsed) VALUES (?,?,?,?)',[MemberID,RewardID,RedemptionDate,reward.PointCost]);
  await query('INSERT INTO POINT_TRANSACTION (PointsEarned,PointsRedeemed,`Date`,PaymentID) VALUES (0,?,?,?)',[reward.PointCost,RedemptionDate,payment.PaymentID]);
  res.status(201).json({message:'แลกรางวัลสำเร็จ',PointsUsed:reward.PointCost});
}catch(e){if(e.code==='ER_DUP_ENTRY')return res.status(409).json({message:'สมาชิกคนนี้เคยแลกรางวัลนี้แล้ว'});sendDbError(res,e);}});

// STEP 4: Report APIs
app.get('/api/reports/availability', async (req,res)=>{try{
  const {date,start,end}=req.query; if(!date||!start||!end||end<=start)return res.status(400).json({message:'date, start and end are required and end must be after start'});
  const rooms=await query(`SELECT r.RoomID,r.RoomName,r.Capacity,s.StudioCode,s.Location,GROUP_CONCAT(DISTINCT st.SportName ORDER BY st.SportName SEPARATOR ', ') SportTypes
    FROM ROOM r JOIN STUDIO s ON s.StudioCode=r.StudioCode LEFT JOIN STUDIO_SPORT_TYPE sst ON sst.StudioCode=s.StudioCode LEFT JOIN SPORT_TYPE st ON st.SportTypeID=sst.SportTypeID
    WHERE NOT EXISTS (SELECT 1 FROM BOOKING b WHERE b.RoomID=r.RoomID AND b.BookingDate=? AND b.StartTime<? AND b.EndTime>?) GROUP BY r.RoomID,r.RoomName,r.Capacity,s.StudioCode,s.Location ORDER BY r.RoomID`,[date,end,start]);
  const equipment=await query(`SELECT e.\`Condition\` AS \`Condition\`,e.EquipmentID,e.Name,e.LateFee,st.SportName FROM EQUIPMENT e LEFT JOIN SPORT_TYPE st ON st.SportTypeID=e.SportTypeID
    WHERE e.\`Condition\` NOT IN ('Damaged','Maintenance') AND NOT EXISTS (SELECT 1 FROM BOOKING_EQUIPMENT be JOIN BOOKING b ON b.BookingID=be.BookingID WHERE be.EquipmentID=e.EquipmentID AND b.BookingDate=? AND b.StartTime<? AND b.EndTime>?) ORDER BY e.EquipmentID`,[date,end,start]);
  const trainers=await query(`SELECT t.TrainerID,t.Name,t.Phone,st.SportName,s.Location FROM TRAINER t JOIN SPORT_TYPE st ON st.SportTypeID=t.SportTypeID JOIN STUDIO s ON s.StudioCode=t.StudioCode
    WHERE NOT EXISTS (SELECT 1 FROM BOOKING_TRAINER bt JOIN BOOKING b ON b.BookingID=bt.BookingID WHERE bt.TrainerID=t.TrainerID AND b.BookingDate=? AND b.StartTime<? AND b.EndTime>?) ORDER BY t.TrainerID`,[date,end,start]);
  res.json({date,start,end,rooms,equipment,trainers});
}catch(e){sendDbError(res,e);}});

app.get('/api/reports/member-points', async (req,res)=>{try{
  const memberId=req.query.memberId;
  const members=await query(`SELECT m.MemberID,m.Name,m.MemberLevel,COALESCE(SUM(pt.PointsEarned),0) Earned,COALESCE(SUM(pt.PointsRedeemed),0) Redeemed,COALESCE(SUM(pt.PointsEarned-pt.PointsRedeemed),0) Balance
    FROM MEMBER m LEFT JOIN BOOKING b ON b.MemberID=m.MemberID LEFT JOIN PAYMENT p ON p.BookingID=b.BookingID LEFT JOIN POINT_TRANSACTION pt ON pt.PaymentID=p.PaymentID
    ${memberId?'WHERE m.MemberID=?':''} GROUP BY m.MemberID,m.Name,m.MemberLevel ORDER BY Balance DESC`,memberId?[memberId]:[]);
  const rewards=await query(`SELECT RewardID,Name,PointCost,Value,Category FROM REWARD_ITEM ORDER BY PointCost`);
  const result=members.map(m=>{const available=rewards.filter(r=>m.Balance>=r.PointCost); const next=rewards.find(r=>m.Balance<r.PointCost); return {...m,AvailableRewards:available,NextReward:next||null,PointsNeeded:next?next.PointCost-m.Balance:0};});
  res.json({members:result,rewards});
}catch(e){sendDbError(res,e);}});

app.get('/api/reports/course-performance', async (req,res)=>{try{
  const courses=await query(`SELECT c.CourseID,c.Title,c.Level,c.StandardFee,COUNT(e.MemberID) Enrollments,SUM(CASE WHEN e.PaymentStatus='Paid' THEN c.StandardFee ELSE 0 END) Revenue
    FROM COURSE c LEFT JOIN ENROLLMENT e ON e.CourseID=c.CourseID GROUP BY c.CourseID,c.Title,c.Level,c.StandardFee ORDER BY Enrollments DESC,Revenue DESC`);
  const monthly=await query(`SELECT DATE_FORMAT(e.EnrollmentDate,'%Y-%m') Month,ROUND(SUM(CASE WHEN e.PaymentStatus='Paid' THEN c.StandardFee ELSE 0 END),2) Revenue
    FROM ENROLLMENT e JOIN COURSE c ON c.CourseID=e.CourseID GROUP BY DATE_FORMAT(e.EnrollmentDate,'%Y-%m') ORDER BY Month`);
  res.json({courses,monthly});
}catch(e){sendDbError(res,e);}});

app.get('/api/admin/dashboard', async (req,res)=>{try{
  const [members]=await query('SELECT COUNT(*) totalMembers FROM MEMBER');
  const [bookings]=await query('SELECT COUNT(*) totalBookings FROM BOOKING');
  const [revenue]=await query('SELECT COALESCE(SUM(Amount),0) totalRevenue FROM PAYMENT');
  const [points]=await query('SELECT COALESCE(SUM(PointsRedeemed),0) totalPointsRedeemed FROM POINT_TRANSACTION');
  const monthlyRevenue=await query(`SELECT DATE_FORMAT(PaymentDate,'%Y-%m') Month,ROUND(SUM(Amount),2) Revenue FROM PAYMENT GROUP BY DATE_FORMAT(PaymentDate,'%Y-%m') ORDER BY Month`);
  const newMembers=await query(`SELECT DATE_FORMAT(CreatedAt,'%Y-%m') Month,COUNT(*) NewMembers FROM MEMBER GROUP BY DATE_FORMAT(CreatedAt,'%Y-%m') ORDER BY Month`);
  res.json({summary:{totalMembers:members.totalMembers,totalBookings:bookings.totalBookings,totalRevenue:Number(revenue.totalRevenue),totalPointsRedeemed:Number(points.totalPointsRedeemed)},monthlyRevenue,newMembers});
}catch(e){sendDbError(res,e);}});

app.get('/api/reports/health', async (req,res)=>{try{const rows=await query('SELECT 1 ok');res.json({ok:rows[0].ok===1});}catch(e){res.status(500).json({ok:false,error:e.message});}});

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log(`🚀 Server running on http://localhost:${PORT}`));
