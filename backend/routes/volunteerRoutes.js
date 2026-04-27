const express = require('express');
const router = express.Router();
const VolunteerProfile = require('../models/VolunteerProfile');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/volunteers
// @desc    Get all volunteers
// @access  Protected
router.get('/', protect, async (req, res) => {
  try {
    const volunteers = await VolunteerProfile.find()
      .populate('user_id', 'name email phone location')
      .sort({ tasks_completed: -1 });

    res.json({ success: true, count: volunteers.length, data: volunteers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/volunteers/:volunteer_id/availability
// @desc    Update volunteer availability
// @access  Protected
router.patch('/:volunteer_id/availability', protect, async (req, res) => {
  try {
    const { availability } = req.body;

    if (!['available', 'busy', 'offline'].includes(availability)) {
      return res.status(400).json({
        success: false,
        message: 'availability must be: available, busy, or offline'
      });
    }

    const volunteer = await VolunteerProfile.findByIdAndUpdate(
      req.params.volunteer_id,
      { availability, last_active: Date.now() },
      { new: true }
    ).populate('user_id', 'name email');

    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    res.json({ success: true, data: volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;