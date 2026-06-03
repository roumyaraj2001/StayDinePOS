const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Calculate distance using Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Return distance in meters
}

// Check-in
router.post('/check-in', async (req, res) => {
  try {
    const { userId, restaurantId, latitude, longitude, faceData, imageUrl } = req.body;

    if (!userId || !restaurantId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get restaurant location for geo-fencing
    const Restaurant = require('../models/Restaurant');
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    // Check if user is within allowed location (100 meters)
    const distance = getDistance(
      restaurant.location.latitude,
      restaurant.location.longitude,
      latitude,
      longitude
    );

    const isInsideLocation = distance <= (restaurant.location.radius || 100);

    // Check if face verification passed (if faceData provided)
    let faceVerified = false;
    let verificationScore = 0;

    if (faceData && user.faceEmbedding) {
      // Simple similarity check (in production, use proper face recognition library)
      verificationScore = 0.85; // Simulated score
      faceVerified = verificationScore > 0.8;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      userId,
      restaurantId,
      date: today,
    });

    if (existingAttendance && existingAttendance.checkInTime) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    const attendance = new Attendance({
      userId,
      restaurantId,
      date: today,
      checkInTime: new Date(),
      checkInLocation: {
        latitude,
        longitude,
        accuracy: req.body.accuracy,
      },
      isInsideLocation,
      faceVerified,
      faceVerificationScore: verificationScore,
      checkInImage: imageUrl,
      status: isInsideLocation && faceVerified ? 'present' : 'present',
    });

    await attendance.save();

    res.status(201).json({
      message: 'Check-in successful',
      attendance,
      warnings: !isInsideLocation ? ['User is outside allowed location'] : [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check-out
router.post('/check-out', async (req, res) => {
  try {
    const { userId, restaurantId, latitude, longitude, imageUrl } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId,
      restaurantId,
      date: today,
    });

    if (!attendance) return res.status(404).json({ error: 'Attendance record not found' });
    if (attendance.checkOutTime) return res.status(400).json({ error: 'Already checked out' });

    attendance.checkOutTime = new Date();
    attendance.checkOutLocation = {
      latitude,
      longitude,
      accuracy: req.body.accuracy,
    };
    attendance.checkOutImage = imageUrl;

    // Calculate total hours
    const checkInTime = new Date(attendance.checkInTime);
    const checkOutTime = new Date(attendance.checkOutTime);
    const diffMs = checkOutTime - checkInTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    attendance.totalHours = Math.round(diffHours * 100) / 100;

    await attendance.save();

    res.json({
      message: 'Check-out successful',
      attendance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance history
router.get('/history/:userId', async (req, res) => {
  try {
    const { restaurantId, startDate, endDate } = req.query;
    const query = { userId: req.params.userId };

    if (restaurantId) query.restaurantId = restaurantId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get staff list with status (for admin)
router.get('/staff/status/:restaurantId', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const staff = await User.find({ 
      restaurantId: req.params.restaurantId,
      role: { $in: ['staff', 'cashier', 'kitchen_staff', 'manager'] },
    });

    const staffStatus = await Promise.all(
      staff.map(async (user) => {
        const todayAttendance = await Attendance.findOne({
          userId: user._id,
          date: today,
        });

        return {
          userId: user._id,
          name: user.name,
          role: user.role,
          status: todayAttendance?.checkInTime ? 'present' : 'absent',
          checkInTime: todayAttendance?.checkInTime,
          checkOutTime: todayAttendance?.checkOutTime,
          isInsideLocation: todayAttendance?.isInsideLocation,
        };
      })
    );

    res.json(staffStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
