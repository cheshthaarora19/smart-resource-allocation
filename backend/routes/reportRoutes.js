const express = require('express');
const router = express.Router();
const IssueReport = require('../models/IssueReport');
const PriorityScore = require('../models/PriorityScore');
const upload = require('../utils/uploadConfig');
const { extractTextFromImage } = require('../services/ocrService');
const { categorizeNeedType, calculatePriorityScore } = require('../services/priorityService');
const { checkDuplicate } = require('../services/duplicateService');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/reports
// @desc    Submit a new issue report (with optional image)
// @access  Protected
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    let { title, description, need_type, lat, lng, address, severity, people_affected } = req.body;

    // If image uploaded, run OCR and extract more info
    if (req.file) {
      const extractedText = await extractTextFromImage(req.file.path);
      if (extractedText) {
        description = description
          ? `${description}\n[Extracted from image]: ${extractedText}`
          : extractedText;

        // Auto-categorize if need_type not provided
        if (!need_type) {
          need_type = categorizeNeedType(extractedText);
        }
      }
    }

    // Auto-categorize from description if still not set
    if (!need_type && description) {
      need_type = categorizeNeedType(description);
    }

    // Check for duplicate
    const { isDuplicate, originalReport } = await checkDuplicate(
      parseFloat(lat), parseFloat(lng), need_type
    );

    // Create the report
    const report = await IssueReport.create({
      reported_by: req.user._id,
      title,
      description,
      need_type,
      location: { lat: parseFloat(lat), lng: parseFloat(lng), address },
      images: req.file ? [req.file.path] : [],
      severity: parseInt(severity),
      people_affected: parseInt(people_affected),
      is_duplicate: isDuplicate,
      duplicate_of: isDuplicate ? originalReport._id : null
    });

    // Calculate and store priority score
    const { priority_score, urgency_level, explanation } = calculatePriorityScore(
      parseInt(severity),
      parseInt(people_affected)
    );

    await PriorityScore.create({
      report_id: report._id,
      priority_score,
      urgency_level,
      explanation
    });

    res.status(201).json({
      success: true,
      data: report,
      priority: { priority_score, urgency_level, explanation },
      duplicate_detected: isDuplicate,
      message: isDuplicate
        ? `Similar report already exists in this area (ID: ${originalReport._id})`
        : 'Report submitted successfully'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/reports
// @desc    Get all reports (with filters)
// @access  Protected
router.get('/', async (req, res) => {
  try {
    const { status, need_type, urgency } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (need_type) filter.need_type = need_type;

    const reports = [
  {
    _id: "1",
    title: "Water shortage",
    need_type: "water",
    severity: 8,
    people_affected: 120,
    location: { address: "Punjabi Bagh" }
  },
  {
    _id: "2",
    title: "Food needed",
    need_type: "food",
    severity: 6,
    people_affected: 80,
    location: { address: "Rohini" }
  }
];
    res.json({ success: true, count: reports.length, data: reports });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/reports/:id/priority
// @desc    Get priority score for a report
// @access  Protected
router.get('/:id/priority', protect, async (req, res) => {
  try {
    const priority = await PriorityScore.findOne({ report_id: req.params.id });
    if (!priority) {
      return res.status(404).json({ success: false, message: 'Priority score not found' });
    }
    res.json({ success: true, data: priority });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;