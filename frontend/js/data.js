/* ============================================
   data.js - Global Mock Data
   ============================================ */

const STUDIOS = [
  {
    StudioCode: "ST001",
    Name: "SheSparks Silom",
    Location: "Silom, Bangkok",
    SportTypes: ["Yoga", "Pilates"],
  },
  {
    StudioCode: "ST002",
    Name: "SheSparks Phayathai",
    Location: "Phayathai, Bangkok",
    SportTypes: ["Boxing", "Badminton"],
  },
  {
    StudioCode: "ST003",
    Name: "SheSparks Ramkhamhaeng",
    Location: "Ramkhamhaeng, Bangkok",
    SportTypes: ["Yoga", "Boxing", "Pilates"],
  },
];

const SPORT_TYPES = [
  { SportTypeID: 1, SportName: "Yoga", IntensityLevel: "Low" },
  { SportTypeID: 2, SportName: "Pilates", IntensityLevel: "Medium" },
  { SportTypeID: 3, SportName: "Boxing", IntensityLevel: "High" },
  { SportTypeID: 4, SportName: "Badminton", IntensityLevel: "Medium" },
];

const ROOMS = [
  {
    RoomID: 1,
    RoomName: "Yoga Room A",
    StudioCode: "ST001",
    SportType: "Yoga",
    Capacity: 20,
    AvailableTimes: ["09:00", "11:00", "14:00"],
  },
  {
    RoomID: 2,
    RoomName: "Pilates Room B",
    StudioCode: "ST001",
    SportType: "Pilates",
    Capacity: 15,
    AvailableTimes: ["10:00", "13:00", "16:00"],
  },
  {
    RoomID: 3,
    RoomName: "Boxing Ring C",
    StudioCode: "ST002",
    SportType: "Boxing",
    Capacity: 10,
    AvailableTimes: ["08:00", "12:00", "17:00"],
  },
  {
    RoomID: 4,
    RoomName: "Badminton Court D",
    StudioCode: "ST002",
    SportType: "Badminton",
    Capacity: 4,
    AvailableTimes: ["09:00", "15:00", "18:00"],
  },
  {
    RoomID: 5,
    RoomName: "Yoga Room E",
    StudioCode: "ST003",
    SportType: "Yoga",
    Capacity: 25,
    AvailableTimes: ["07:00", "11:00", "16:00"],
  },
  {
    RoomID: 6,
    RoomName: "Boxing Room F",
    StudioCode: "ST003",
    SportType: "Boxing",
    Capacity: 12,
    AvailableTimes: ["10:00", "14:00", "19:00"],
  },
  {
    RoomID: 7,
    RoomName: "Pilates Room G",
    StudioCode: "ST003",
    SportType: "Pilates",
    Capacity: 18,
    AvailableTimes: ["09:00", "13:00", "17:00"],
  },
];

const TRAINERS = [
  {
    TrainerID: 1,
    Name: "Coach Mali",
    SportType: "Yoga",
    Phone: "081-111-1111",
  },
  {
    TrainerID: 2,
    Name: "Coach Ploy",
    SportType: "Pilates",
    Phone: "082-222-2222",
  },
  {
    TrainerID: 3,
    Name: "Coach Fah",
    SportType: "Boxing",
    Phone: "083-333-3333",
  },
  {
    TrainerID: 4,
    Name: "Coach Nam",
    SportType: "Badminton",
    Phone: "084-444-4444",
  },
];

const COURSES = [
  {
    CourseID: 1,
    Title: "Basic Yoga",
    Level: "Beginner",
    DurationHours: 10,
    StandardFee: 1500,
  },
  {
    CourseID: 2,
    Title: "Advanced Yoga",
    Level: "Advanced",
    DurationHours: 15,
    StandardFee: 2500,
  },
  {
    CourseID: 3,
    Title: "Pilates Intro",
    Level: "Beginner",
    DurationHours: 8,
    StandardFee: 1200,
  },
  {
    CourseID: 4,
    Title: "Women Boxing",
    Level: "Intermediate",
    DurationHours: 12,
    StandardFee: 2000,
  },
];

const REWARDS = [
  {
    RewardID: 1,
    Name: "Spa Voucher 500 THB",
    PointCost: 500,
    Category: "Beauty",
  },
  { RewardID: 2, Name: "Hair Treatment", PointCost: 300, Category: "Beauty" },
  { RewardID: 3, Name: "Yoga Mat", PointCost: 800, Category: "Sports" },
  { RewardID: 4, Name: "10% Discount", PointCost: 100, Category: "Discount" },
];

const POINTS = {
  total: 1250,
  history: [
    { Date: "2026-09-01", Earned: 300, Redeemed: 0 },
    { Date: "2026-09-05", Earned: 0, Redeemed: 200 },
    { Date: "2026-09-10", Earned: 500, Redeemed: 0 },
  ],
};

const USERS = [
  {
    id: "M001",
    password: "1234",
    role: "member",
    name: "Member Demo",
    email: "member@shesparks.com",
  },
  {
    id: "A001",
    password: "admin",
    role: "admin",
    name: "Admin Demo",
    email: "admin@shesparks.com",
  },
];
