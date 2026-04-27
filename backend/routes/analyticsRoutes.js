const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getSummaryAnalytics, getVolunteerAnalytics } = require('../services/analyticsService');

// @route   GET /api/analytics/summary
// @desc    Get overall analytics summary
// @access  Protected
router.get('/summary', protect, async (req, res) => {
  try {
    const { region, days } = req.query;
    const data = await getSummaryAnalytics(region, parseInt(days) || 7);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/analytics/volunteers
// @desc    Get volunteer analytics
// @access  Protected
router.get('/volunteers', protect, async (req, res) => {
  try {
    const data = await getVolunteerAnalytics();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/analytics/impact
// @desc    Get impact score — how many lives improved
// @access  Protected
router.get('/impact', protect, async (req, res) => {
  try {
    const IssueReport = require('../models/IssueReport');

    const result = await IssueReport.aggregate([
      { $match: { status: 'resolved' } },
      {
        $group: {
          _id: null,
          total_people_helped: { $sum: '$people_affected' },
          total_resolved: { $sum: 1 }
        }
      }
    ]);

    const impact = result[0] || { total_people_helped: 0, total_resolved: 0 };

    res.json({
      success: true,
      data: {
        total_people_helped: impact.total_people_helped,
        total_issues_resolved: impact.total_resolved,
        impact_score: impact.total_people_helped * 10
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;