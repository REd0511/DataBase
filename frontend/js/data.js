/* ============================================
   data.js - Global Mock Data (Phase D)
   ============================================ */

const STUDIOS = [
  {
    StudioCode: "ST001",
    Name: "SheSparks Nimman",
    Location: "Nimman, Chiang Mai",
    Capacity: 50,
    ImageURL:
      "https://sponsoredworkpermit.com/wp-content/uploads/2025/09/6385c11e3fff88628f36e7eb_SWP-blog-image.jpg",
  },
  {
    StudioCode: "ST002",
    Name: "SheSparks Old City",
    Location: "Old City, Chiang Mai",
    Capacity: 40,
    ImageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYOL7TtMv4uEkirUH0yoSsp8uVU5FuQzNl8uFymQh7KxgAk6r68PPwMgo&s=10",
  },
  {
    StudioCode: "ST003",
    Name: "SheSparks Riverside",
    Location: "Riverside, Chiang Mai",
    Capacity: 60,
    ImageURL:
      "https://thechiangmai.com/riverside/wp-content/uploads/2023/10/Live-the-Suite-Life.jpg",
  },
];

const SPORT_TYPES = [
  {
    SportTypeID: 1,
    SportName: "Yoga",
    IntensityLevel: "Low",
    ImageURL: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
  },
  {
    SportTypeID: 2,
    SportName: "Pilates",
    IntensityLevel: "Medium",
    ImageURL:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400",
  },
  {
    SportTypeID: 3,
    SportName: "Boxing",
    IntensityLevel: "High",
    ImageURL:
      "https://www.lecercle-boxing.com/wp-content/uploads/2024/10/allonge-boxe-cover.jpg",
  },
  {
    SportTypeID: 4,
    SportName: "Badminton",
    IntensityLevel: "Medium",
    ImageURL:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400",
  },
];

const ROOMS = [
  {
    RoomID: 1,
    RoomName: "Yoga Room A",
    StudioCode: "ST001",
    SportTypeID: 1,
    Capacity: 20,
    ImageURL:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/f3/71/95/yoga-studio-on-6th-floor.jpg?w=1200&h=1200&s=1",
  },
  {
    RoomID: 2,
    RoomName: "Pilates Room B",
    StudioCode: "ST001",
    SportTypeID: 2,
    Capacity: 15,
    ImageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcFdpjDVDQMtEqvSlfb8WhliMusPHTfxLqybpgnLrfroHdDglf0TzB6of5&s=10",
  },
  {
    RoomID: 3,
    RoomName: "Boxing Ring C",
    StudioCode: "ST002",
    SportTypeID: 3,
    Capacity: 10,
    ImageURL:
      "https://www.protecboxing.com/wp-content/uploads/2023/10/IMG_8300-scaled.webp",
  },
  {
    RoomID: 4,
    RoomName: "Badminton Court D",
    StudioCode: "ST002",
    SportTypeID: 4,
    Capacity: 4,
    ImageURL:
      "https://cdn.sportsforlife.in/shared/blog-images/13-01-26/77bd4b83-5bab-4704-85a1-9036bbb49afc_What_Are_the_13_Basic_Rules_of_Badminton___1768295243637.png",
  },
  {
    RoomID: 5,
    RoomName: "Yoga Room E",
    StudioCode: "ST003",
    SportTypeID: 1,
    Capacity: 25,
    ImageURL:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/f3/71/95/yoga-studio-on-6th-floor.jpg?w=1200&h=1200&s=1",
  },
  {
    RoomID: 6,
    RoomName: "Boxing Room F",
    StudioCode: "ST003",
    SportTypeID: 3,
    Capacity: 12,
    ImageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6kDBsDu_xoAFt6o2lPvpHwPQJheFzwGr0NDOQ7wHZh4NiUdAVqlCFxGYV&s=10",
  },
  {
    RoomID: 7,
    RoomName: "Pilates Room G",
    StudioCode: "ST003",
    SportTypeID: 2,
    Capacity: 18,
    ImageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcFdpjDVDQMtEqvSlfb8WhliMusPHTfxLqybpgnLrfroHdDglf0TzB6of5&s=10",
  },
];

const TRAINERS = [
  {
    TrainerID: 1,
    Name: "Coach Mali",
    SportTypeID: 1,
    Phone: "081-111-1111",
    StudioCode: "ST001",
    Qualification: "Certified Yoga Instructor",
    ImageURL:
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400",
  },
  {
    TrainerID: 2,
    Name: "Coach Ploy",
    SportTypeID: 2,
    Phone: "082-222-2222",
    StudioCode: "ST001",
    Qualification: "Pilates Master Trainer",
    ImageURL: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400",
  },
  {
    TrainerID: 3,
    Name: "Coach Fah",
    SportTypeID: 3,
    Phone: "083-333-3333",
    StudioCode: "ST002",
    Qualification: "Professional Boxing Coach",
    ImageURL:
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400",
  },
  {
    TrainerID: 4,
    Name: "Coach Nam",
    SportTypeID: 4,
    Phone: "084-444-4444",
    StudioCode: "ST002",
    Qualification: "Badminton National Coach",
    ImageURL: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400",
  },
];

const COURSES = [
  {
    CourseID: 1,
    Title: "Basic Yoga",
    Level: "Beginner",
    DurationHours: 10,
    StandardFee: 1500,
    StudioCode: "ST001",
    RoomID: 1,
    TrainerID: 1,
    PrerequisiteCourseID: null,
    ImageURL:
      "https://yogadesignlab.com/cdn/shop/articles/yoga_design_lab_small_group_easy_seat_pose_5c878a0d-fff0-41dd-8e77-a6e5e0000567.webp?v=1790467490&width=1400",
  },
  {
    CourseID: 2,
    Title: "Advanced Yoga",
    Level: "Advanced",
    DurationHours: 15,
    StandardFee: 2500,
    StudioCode: "ST001",
    RoomID: 1,
    TrainerID: 1,
    PrerequisiteCourseID: 1,
    ImageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYEA1aWsFKwzUUa-BXmztEbD7CFSUCsk_d7a-UR2avsydNTFluTib4ZJE&s=10",
  },
  {
    CourseID: 3,
    Title: "Pilates Intro",
    Level: "Beginner",
    DurationHours: 8,
    StandardFee: 1200,
    StudioCode: "ST001",
    RoomID: 2,
    TrainerID: 2,
    PrerequisiteCourseID: null,
    ImageURL:
      "https://www.theglobeandmail.com/resizer/v2/OPSNENUCHJCBNA42EFNMQG5GOI.jpg?auth=2f0966c784232bb248a759ddd9d65361523b7e03e2f962be477ce97e6b4f41a5&width=600&height=400&quality=80&smart=true",
  },
  {
    CourseID: 4,
    Title: "Women Boxing",
    Level: "Intermediate",
    DurationHours: 12,
    StandardFee: 2000,
    StudioCode: "ST002",
    RoomID: 3,
    TrainerID: 3,
    PrerequisiteCourseID: null,
    ImageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSztNMgR2wBQ9w6VeE95xAAXqy-CWHqJif9Tfnl8hAbNwov72SrcLLBio6d&s=10",
  },
];

const REWARDS = [
  {
    RewardID: 1,
    Name: "Spa Voucher 500 THB",
    PointCost: 500,
    Value: 500,
    Category: "Beauty",
    ImageURL:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400",
  },
  {
    RewardID: 2,
    Name: "Hair Treatment",
    PointCost: 300,
    Value: 300,
    Category: "Beauty",
    ImageURL: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
  },
  {
    RewardID: 3,
    Name: "Yoga Mat",
    PointCost: 800,
    Value: 800,
    Category: "Sports",
    ImageURL:
      "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400",
  },
  {
    RewardID: 4,
    Name: "10% Discount for SheSparks Thai massage",
    PointCost: 100,
    Value: 100,
    Category: "Discount",
    ImageURL:
      "https://images.gowabi.com/pictures/images/000/194/101/big_slider_pic/58.png?1752746788",
  },
];

// ==================== BRIDGE TABLES ====================

// Studio ↔ SportType (M:N)
const STUDIO_SPORT_TYPE = [
  { StudioCode: "ST001", SportTypeID: 1 }, // Silom - Yoga
  { StudioCode: "ST001", SportTypeID: 2 }, // Silom - Pilates
  { StudioCode: "ST002", SportTypeID: 3 }, // Phayathai - Boxing
  { StudioCode: "ST002", SportTypeID: 4 }, // Phayathai - Badminton
  { StudioCode: "ST003", SportTypeID: 1 }, // Ramkhamhaeng - Yoga
  { StudioCode: "ST003", SportTypeID: 3 }, // Ramkhamhaeng - Boxing
  { StudioCode: "ST003", SportTypeID: 2 }, // Ramkhamhaeng - Pilates
];

// Course Prerequisite (Recursive M:N)
const COURSE_PREREQUISITE = [
  { CourseID: 2, PrerequisiteCourseID: 1 }, // Advanced Yoga ← Basic Yoga
];

// ==================== POINTS ====================
const POINTS = {
  total: 0,
  history: [],
};

// ==================== LOYALTY POINTS RULE ====================
const LOYALTY_POINTS = {
  pointsPerBaht: 1, // 1 point per 1 THB spent
};

// ==================== LOYALTY POINTS RULES ====================
const LOYALTY_RULES = {
  pointsPerHour: 30, // คะแนนต่อชั่วโมง (Room)
  pointsPerTrainer: 50, // คะแนนต่อ Trainer
  pointsPerEquipment: 20, // คะแนนต่อ Equipment
  pointsPerCapacity: 2, // คะแนนต่อคน
};
// ==================== USERS ====================
const USERS = [
  // MEMBER
  {
    id: "M001",
    password: "1234",
    role: "member",
    name: "Member Demo",
    email: "member@shesparks.com",
    memberLevel: "Silver",
  },
  // ADMIN
  {
    id: "A001",
    password: "admin",
    role: "admin",
    name: "Admin Demo",
    email: "admin@shesparks.com",
  },
  // TRAINER
  {
    id: "T001",
    password: "trainer",
    role: "trainer",
    name: "Coach Mali",
    email: "mali@shesparks.com",
    trainerId: 1,
    sportTypeID: 1,
    studioCode: "ST001",
  },
  {
    id: "T002",
    password: "trainer",
    role: "trainer",
    name: "Coach Ploy",
    email: "ploy@shesparks.com",
    trainerId: 2,
    sportTypeID: 2,
    studioCode: "ST001",
  },
  {
    id: "T003",
    password: "trainer",
    role: "trainer",
    name: "Coach Fah",
    email: "fah@shesparks.com",
    trainerId: 3,
    sportTypeID: 3,
    studioCode: "ST002",
  },
  {
    id: "T004",
    password: "trainer",
    role: "trainer",
    name: "Coach Nam",
    email: "nam@shesparks.com",
    trainerId: 4,
    sportTypeID: 4,
    studioCode: "ST002",
  },
  // MANAGER
  {
    id: "S001",
    password: "manager",
    role: "manager",
    name: "Manager Silom",
    email: "silom@shesparks.com",
    studioCode: "ST001",
  },
  {
    id: "S002",
    password: "manager",
    role: "manager",
    name: "Manager Phayathai",
    email: "phayathai@shesparks.com",
    studioCode: "ST002",
  },
  {
    id: "S003",
    password: "manager",
    role: "manager",
    name: "Manager Ramkhamhaeng",
    email: "ramkhamhaeng@shesparks.com",
    studioCode: "ST003",
  },
];

// ==================== EQUIPMENT ====================
const EQUIPMENTS = [
  {
    EquipmentID: 1,
    Name: "Yoga Mat Pro",
    SportTypeID: 1,
    StudioCode: "ST001",
    Condition: "Good",
    LateFee: 50,
    ImageURL:
      "https://mandukathailand.com/cdn/shop/files/111011Z30-Mats-PRO71-VERVE-02_c20a6342-8663-4436-8441-093cfd3d0f5d_1080x.jpg?v=1738237472",
  },
  {
    EquipmentID: 2,
    Name: "Yoga Block",
    SportTypeID: 1,
    StudioCode: "ST001",
    Condition: "Good",
    LateFee: 30,
    ImageURL:
      "https://cdn.shopify.com/s/files/1/0700/8141/3360/files/yoga-brick-lifestyle-1.webp?v=1772885511&width=1000",
  },
  {
    EquipmentID: 3,
    Name: "Pilates Ball",
    SportTypeID: 2,
    StudioCode: "ST001",
    Condition: "Good",
    LateFee: 80,
    ImageURL:
      "https://contents.mediadecathlon.com/p3067465/k$ebc9793bcd6ee90c724d45b7bb344dc4/900-g-weighted-pilates-ball-brown-domyos-8975529.jpg?f=1920x0&format=auto",
  },
  {
    EquipmentID: 4,
    Name: "Pilates Ring",
    SportTypeID: 2,
    StudioCode: "ST001",
    Condition: "Good",
    LateFee: 100,
    ImageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRIdM_7eNVmuMrCfQtUrS_5658U_O3ii07Umpn4eesQ5bFk1QL5mABWCro&s=10",
  },
  {
    EquipmentID: 5,
    Name: "Boxing Gloves",
    SportTypeID: 3,
    StudioCode: "ST002",
    Condition: "Good",
    LateFee: 120,
    ImageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKjp1FY6k2x0eKZfeIA_dhWtubgZJhq3u4mSyENJVa4W0tMiARcsNY-Vk&s=10",
  },
  {
    EquipmentID: 6,
    Name: "Boxing Wraps",
    SportTypeID: 3,
    StudioCode: "ST002",
    Condition: "Good",
    LateFee: 60,
    ImageURL:
      "https://www.ringside.com/media/catalog/product/cache/0ee050c3ffc3555709b9bb6062f4d7e9/m/h/mhw_v5.webp",
  },
  {
    EquipmentID: 7,
    Name: "Badminton Racket",
    SportTypeID: 4,
    StudioCode: "ST002",
    Condition: "Good",
    LateFee: 90,
    ImageURL:
      "https://cdn11.bigcommerce.com/s-nehqfptb/images/stencil/1280x1280/products/42216/82626/Raven-DONE__98056.1732044847.jpg?c=2",
  },
  {
    EquipmentID: 8,
    Name: "Shuttlecock",
    SportTypeID: 4,
    StudioCode: "ST002",
    Condition: "Good",
    LateFee: 20,
    ImageURL:
      "https://us.yonex.com/cdn/shop/collections/LG7_N_A_0933.jpg?v=1740017753",
  },
];

// ==================== HELPER FUNCTIONS (Equipment) ====================
function getEquipmentsByStudio(studioCode) {
  return EQUIPMENTS.filter((e) => e.StudioCode === studioCode);
}

function getEquipmentsBySport(sportTypeID) {
  return EQUIPMENTS.filter((e) => e.SportTypeID === sportTypeID);
}

function getEquipmentName(equipmentID) {
  const eq = EQUIPMENTS.find((e) => e.EquipmentID === equipmentID);
  return eq ? eq.Name : "Unknown";
}

// ==================== HELPER FUNCTIONS ====================

// หาชื่อ Sport จาก ID
function getSportName(sportTypeID) {
  const sport = SPORT_TYPES.find((s) => s.SportTypeID === sportTypeID);
  return sport ? sport.SportName : "Unknown";
}

// หาชื่อ Studio จาก Code
function getStudioName(studioCode) {
  const studio = STUDIOS.find((s) => s.StudioCode === studioCode);
  return studio ? studio.Name : "Unknown";
}

// หาชื่อ Room จาก ID
function getRoomName(roomID) {
  const room = ROOMS.find((r) => r.RoomID === roomID);
  return room ? room.RoomName : "Unknown";
}

// หาชื่อ Trainer จาก ID
function getTrainerName(trainerID) {
  const trainer = TRAINERS.find((t) => t.TrainerID === trainerID);
  return trainer ? trainer.Name : "Unknown";
}

// หาชื่อ Course จาก ID
function getCourseName(courseID) {
  const course = COURSES.find((c) => c.CourseID === courseID);
  return course ? course.Title : "Unknown";
}

// ดึง SportTypes ที่ Studio มี
function getStudioSports(studioCode) {
  return STUDIO_SPORT_TYPE.filter((sst) => sst.StudioCode === studioCode)
    .map((sst) => SPORT_TYPES.find((s) => s.SportTypeID === sst.SportTypeID))
    .filter(Boolean);
}

// ดึง Rooms ที่อยู่ใน Studio
function getRoomsByStudio(studioCode) {
  return ROOMS.filter((r) => r.StudioCode === studioCode);
}

// ดึง Courses ที่มี Prerequisite
function getPrerequisiteCourses(courseID) {
  return COURSE_PREREQUISITE.filter((cp) => cp.CourseID === courseID)
    .map((cp) => COURSES.find((c) => c.CourseID === cp.PrerequisiteCourseID))
    .filter(Boolean);
}

// ==================== MEMBER LEVEL ====================
const MEMBER_LEVELS = {
  Silver: {
    label: "Silver",
    pointsMultiplier: 1,
    discount: 0,
    color: "#c0c0c0",
  },
  Gold: {
    label: "Gold",
    pointsMultiplier: 1.5,
    discount: 5,
    color: "#d4af7a",
  },
  Platinum: {
    label: "Platinum",
    pointsMultiplier: 2,
    discount: 10,
    color: "#e5e4e2",
  },
};

// ✅ คำนวณ Member Level จากจำนวนการจอง
function calculateMemberLevel(memberId) {
  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const memberBookings = bookings.filter((b) => b.MemberID === memberId);
  const count = memberBookings.length;

  if (count >= 10) return "Platinum";
  if (count >= 5) return "Gold";
  return "Silver";
}

function getMemberLevel(memberId) {
  // check overrides
  const overrides =
    JSON.parse(localStorage.getItem("memberLevelOverrides")) || {};
  if (overrides[memberId]) {
    return overrides[memberId];
  }

  // Check from User (Manual — Admin can set)
  const user = USERS.find((u) => u.id === memberId);
  if (user && user.memberLevel) {
    return user.memberLevel;
  }

  // Fallback to calculation
  return calculateMemberLevel(memberId);
}

// Pull Member Level Info
function getMemberLevelInfo(level) {
  return MEMBER_LEVELS[level] || MEMBER_LEVELS.Silver;
}
