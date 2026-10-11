/* ============================================
   data.js - Global Mock Data (Phase D)
   ============================================ */

const STUDIOS = [
  { StudioCode: "ST001", Name: "SheSparks Silom", Location: "Silom, Bangkok", Capacity: 50, ImageURL: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400" },
  { StudioCode: "ST002", Name: "SheSparks Phayathai", Location: "Phayathai, Bangkok", Capacity: 40, ImageURL: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400" },
  { StudioCode: "ST003", Name: "SheSparks Ramkhamhaeng", Location: "Ramkhamhaeng, Bangkok", Capacity: 60, ImageURL: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400" },
];

const SPORT_TYPES = [
  { SportTypeID: 1, SportName: "Yoga", IntensityLevel: "Low", ImageURL: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400" },
  { SportTypeID: 2, SportName: "Pilates", IntensityLevel: "Medium", ImageURL: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400" },
  { SportTypeID: 3, SportName: "Boxing", IntensityLevel: "High", ImageURL: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400" },
  { SportTypeID: 4, SportName: "Badminton", IntensityLevel: "Medium", ImageURL: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400" },
];

const ROOMS = [
  { RoomID: 1, RoomName: "Yoga Room A", StudioCode: "ST001", SportTypeID: 1, Capacity: 20, ImageURL: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400" },
  { RoomID: 2, RoomName: "Pilates Room B", StudioCode: "ST001", SportTypeID: 2, Capacity: 15, ImageURL: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400" },
  { RoomID: 3, RoomName: "Boxing Ring C", StudioCode: "ST002", SportTypeID: 3, Capacity: 10, ImageURL: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400" },
  { RoomID: 4, RoomName: "Badminton Court D", StudioCode: "ST002", SportTypeID: 4, Capacity: 4, ImageURL: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400" },
  { RoomID: 5, RoomName: "Yoga Room E", StudioCode: "ST003", SportTypeID: 1, Capacity: 25, ImageURL: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400" },
  { RoomID: 6, RoomName: "Boxing Room F", StudioCode: "ST003", SportTypeID: 3, Capacity: 12, ImageURL: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400" },
  { RoomID: 7, RoomName: "Pilates Room G", StudioCode: "ST003", SportTypeID: 2, Capacity: 18, ImageURL: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400" },
];

const TRAINERS = [
  { TrainerID: 1, Name: "Coach Mali", SportTypeID: 1, Phone: "081-111-1111", StudioCode: "ST001", Qualification: "Certified Yoga Instructor", ImageURL: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400" },
  { TrainerID: 2, Name: "Coach Ploy", SportTypeID: 2, Phone: "082-222-2222", StudioCode: "ST001", Qualification: "Pilates Master Trainer", ImageURL: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400" },
  { TrainerID: 3, Name: "Coach Fah", SportTypeID: 3, Phone: "083-333-3333", StudioCode: "ST002", Qualification: "Professional Boxing Coach", ImageURL: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400" },
  { TrainerID: 4, Name: "Coach Nam", SportTypeID: 4, Phone: "084-444-4444", StudioCode: "ST002", Qualification: "Badminton National Coach", ImageURL: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400" },
];

const COURSES = [
  { CourseID: 1, Title: "Basic Yoga", Level: "Beginner", DurationHours: 10, StandardFee: 1500, StudioCode: "ST001", RoomID: 1, TrainerID: 1, PrerequisiteCourseID: null, ImageURL: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400" },
  { CourseID: 2, Title: "Advanced Yoga", Level: "Advanced", DurationHours: 15, StandardFee: 2500, StudioCode: "ST001", RoomID: 1, TrainerID: 1, PrerequisiteCourseID: 1, ImageURL: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400" },
  { CourseID: 3, Title: "Pilates Intro", Level: "Beginner", DurationHours: 8, StandardFee: 1200, StudioCode: "ST001", RoomID: 2, TrainerID: 2, PrerequisiteCourseID: null, ImageURL: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400" },
  { CourseID: 4, Title: "Women Boxing", Level: "Intermediate", DurationHours: 12, StandardFee: 2000, StudioCode: "ST002", RoomID: 3, TrainerID: 3, PrerequisiteCourseID: null, ImageURL: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400" },
];

const REWARDS = [
  { RewardID: 1, Name: "Spa Voucher 500 THB", PointCost: 500, Value: 500, Category: "Beauty", ImageURL: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400" },
  { RewardID: 2, Name: "Hair Treatment", PointCost: 300, Value: 300, Category: "Beauty", ImageURL: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400" },
  { RewardID: 3, Name: "Yoga Mat", PointCost: 800, Value: 800, Category: "Sports", ImageURL: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400" },
  { RewardID: 4, Name: "10% Discount", PointCost: 100, Value: 100, Category: "Discount", ImageURL: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400" },
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
  total: 1250,
  history: [
    { Date: "2026-09-01", Earned: 300, Redeemed: 0 },
    { Date: "2026-09-05", Earned: 0, Redeemed: 200 },
    { Date: "2026-09-10", Earned: 500, Redeemed: 0 },
  ],
};

// ==================== LOYALTY POINTS RULE ====================
const LOYALTY_POINTS = {
  pointsPerBaht: 1, // 1 บาท = 1 แต้ม
};

// ==================== USERS ====================
const USERS = [
  // MEMBER
  { id: "M001", password: "1234", role: "member", name: "Member Demo", email: "member@shesparks.com" },
  // ADMIN
  { id: "A001", password: "admin", role: "admin", name: "Admin Demo", email: "admin@shesparks.com" },
  // TRAINER
  { id: "T001", password: "trainer", role: "trainer", name: "Coach Mali", email: "mali@shesparks.com", trainerId: 1, sportTypeID: 1, studioCode: "ST001" },
  { id: "T002", password: "trainer", role: "trainer", name: "Coach Ploy", email: "ploy@shesparks.com", trainerId: 2, sportTypeID: 2, studioCode: "ST001" },
  { id: "T003", password: "trainer", role: "trainer", name: "Coach Fah", email: "fah@shesparks.com", trainerId: 3, sportTypeID: 3, studioCode: "ST002" },
  { id: "T004", password: "trainer", role: "trainer", name: "Coach Nam", email: "nam@shesparks.com", trainerId: 4, sportTypeID: 4, studioCode: "ST002" },
  // MANAGER
  { id: "S001", password: "manager", role: "manager", name: "Manager Silom", email: "silom@shesparks.com", studioCode: "ST001" },
  { id: "S002", password: "manager", role: "manager", name: "Manager Phayathai", email: "phayathai@shesparks.com", studioCode: "ST002" },
  { id: "S003", password: "manager", role: "manager", name: "Manager Ramkhamhaeng", email: "ramkhamhaeng@shesparks.com", studioCode: "ST003" },
];

// ==================== HELPER FUNCTIONS ====================

// หาชื่อ Sport จาก ID
function getSportName(sportTypeID) {
  const sport = SPORT_TYPES.find(s => s.SportTypeID === sportTypeID);
  return sport ? sport.SportName : "Unknown";
}

// หาชื่อ Studio จาก Code
function getStudioName(studioCode) {
  const studio = STUDIOS.find(s => s.StudioCode === studioCode);
  return studio ? studio.Name : "Unknown";
}

// หาชื่อ Room จาก ID
function getRoomName(roomID) {
  const room = ROOMS.find(r => r.RoomID === roomID);
  return room ? room.RoomName : "Unknown";
}

// หาชื่อ Trainer จาก ID
function getTrainerName(trainerID) {
  const trainer = TRAINERS.find(t => t.TrainerID === trainerID);
  return trainer ? trainer.Name : "Unknown";
}

// หาชื่อ Course จาก ID
function getCourseName(courseID) {
  const course = COURSES.find(c => c.CourseID === courseID);
  return course ? course.Title : "Unknown";
}

// ดึง SportTypes ที่ Studio มี
function getStudioSports(studioCode) {
  return STUDIO_SPORT_TYPE
    .filter(sst => sst.StudioCode === studioCode)
    .map(sst => SPORT_TYPES.find(s => s.SportTypeID === sst.SportTypeID))
    .filter(Boolean);
}

// ดึง Rooms ที่อยู่ใน Studio
function getRoomsByStudio(studioCode) {
  return ROOMS.filter(r => r.StudioCode === studioCode);
}

// ดึง Courses ที่มี Prerequisite
function getPrerequisiteCourses(courseID) {
  return COURSE_PREREQUISITE
    .filter(cp => cp.CourseID === courseID)
    .map(cp => COURSES.find(c => c.CourseID === cp.PrerequisiteCourseID))
    .filter(Boolean);
}