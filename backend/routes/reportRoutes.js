const express = require('express');
const router = express.Router();
const IssueReport = require('../models/IssueReport');
const PriorityScore = require('../models/PriorityScore');
const upload = require('../utils/uploadConfig');
const { extractTextFromImage } = require('../services/ocrService');
const { categorizeNeedType, calculatePriorityScore } = require('../services/priorityService');
const { checkDuplicate } = require('../services/duplicateService');
const { protect } = require('../middleware/authMiddleware');
const { categorizeWithGemini, explainPriorityWithGemini } = require('../services/geminiService');

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
    // Auto-categorize using Gemini first, fallback to keyword NLP
    if (!need_type && description) {
      const geminiCategory = await categorizeWithGemini(description);
      need_type = geminiCategory || categorizeNeedType(description);
      console.log(`🤖 Gemini categorized as: ${need_type}`);
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
    const { priority_score, urgency_level, explanation: formulaExplanation } = calculatePriorityScore(
      parseInt(severity),
      parseInt(people_affected)
    );

    // Get Gemini-powered explanation, fallback to formula
    const geminiExplanation = await explainPriorityWithGemini({
      title,
      need_type,
      severity: parseInt(severity),
      people_affected: parseInt(people_affected),
      location: address || 'Unknown location',
      priority_score,
      urgency_level
    });

const finalExplanation = geminiExplanation || formulaExplanation;

await PriorityScore.create({
  report_id: report._id,
  priority_score,
  urgency_level,
  explanation: finalExplanation
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
router.get('/', protect, async (req, res) => {
  try {
    const { status, need_type, urgency } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (need_type) filter.need_type = need_type;
    const reports = await IssueReport.find(filter)
      .populate('reported_by', 'name email')
      .sort({ createdAt: -1 });

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
// @route   GET /api/reports/my-reports
// @desc    Citizen sees their own submitted reports
// @access  Protected
router.get('/my-reports', protect, async (req, res) => {
  try {
    const reports = await IssueReport.find({ reported_by: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/reports/:id/status
// @desc    Citizen tracks their report status
// @access  Protected
router.get('/:id/status', protect, async (req, res) => {
  try {
    const report = await IssueReport.findById(req.params.id)
      .select('title status need_type severity people_affected createdAt location');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Get priority score for this report
    const priority = await PriorityScore.findOne({ report_id: req.params.id })
      .select('priority_score urgency_level explanation');

    res.json({
      success: true,
      data: {
        report,
        priority,
        message: report.status === 'pending'
          ? 'Your report is under review'
          : report.status === 'assigned'
          ? 'A volunteer has been assigned to your report'
          : 'Your report has been resolved. Thank you!'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;