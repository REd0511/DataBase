/* ============================================
   booking-data.js - Mock Data for Booking Flow
   FEATURES:
   - เก็บข้อมูล Studio, SportType, Room
   - แต่ละ Studio มี SportType ที่เปิดสอน
   - แต่ละ Room อยู่ใน Studio และรองรับ SportType
   ============================================ */

const STUDIOS = [
    {
        StudioCode: 'ST001',
        Name: 'SheSparks Silom',
        Location: 'Silom, Bangkok',
        SportTypes: ['Yoga', 'Pilates']
    },
    {
        StudioCode: 'ST002',
        Name: 'SheSparks Phayathai',
        Location: 'Phayathai, Bangkok',
        SportTypes: ['Boxing', 'Badminton']
    },
    {
        StudioCode: 'ST003',
        Name: 'SheSparks Ramkhamhaeng',
        Location: 'Ramkhamhaeng, Bangkok',
        SportTypes: ['Yoga', 'Boxing', 'Pilates']
    }
];

const SPORT_TYPES = [
    { SportTypeID: 1, SportName: 'Yoga', IntensityLevel: 'Low' },
    { SportTypeID: 2, SportName: 'Pilates', IntensityLevel: 'Medium' },
    { SportTypeID: 3, SportName: 'Boxing', IntensityLevel: 'High' },
    { SportTypeID: 4, SportName: 'Badminton', IntensityLevel: 'Medium' }
];

const ROOMS = [
    // Silom
    { RoomID: 1, RoomName: 'Yoga Room A', StudioCode: 'ST001', SportType: 'Yoga', Capacity: 20 },
    { RoomID: 2, RoomName: 'Pilates Room B', StudioCode: 'ST001', SportType: 'Pilates', Capacity: 15 },

    // Phayathai
    { RoomID: 3, RoomName: 'Boxing Ring C', StudioCode: 'ST002', SportType: 'Boxing', Capacity: 10 },
    { RoomID: 4, RoomName: 'Badminton Court D', StudioCode: 'ST002', SportType: 'Badminton', Capacity: 4 },

    // Ramkhamhaeng
    { RoomID: 5, RoomName: 'Yoga Room E', StudioCode: 'ST003', SportType: 'Yoga', Capacity: 25 },
    { RoomID: 6, RoomName: 'Boxing Room F', StudioCode: 'ST003', SportType: 'Boxing', Capacity: 12 },
    { RoomID: 7, RoomName: 'Pilates Room G', StudioCode: 'ST003', SportType: 'Pilates', Capacity: 18 }
];