const express = require("express");
const router = express.Router();

// temporary in-memory store
let assignments = [];

// POST /api/assign
router.post("/", (req, res) => {
  const { report_id, volunteer_id } = req.body;

  if (!report_id || !volunteer_id) {
    return res.status(400).json({
      success: false,
      message: "report_id and volunteer_id are required"
    });
  }

  const assignment = {
    id: Date.now().toString(),
    report_id,
    volunteer_id,
    status: "assigned",
    assigned_at: new Date()
  };

  assignments.push(assignment);

  res.json({
    success: true,
    message: "Volunteer assigned successfully",
    data: assignment
  });
});

// GET all assignments
router.get("/", (req, res) => {
  res.json({
    success: true,
    data: assignments
  });
});
// AUTO ASSIGN BEST VOLUNTEER
router.post("/auto/:reportId", (req, res) => {
  const reportId = req.params.reportId;

  // TEMP mock data (same as match)
  const volunteers = [
    {
      _id: "v1",
      name: "Amit",
      skills: ["medical"],
      location: "Punjabi Bagh",
      rating: 4.5,
      availability: "available"
    },
    {
      _id: "v2",
      name: "Riya",
      skills: ["food", "logistics"],
      location: "Rohini",
      rating: 4.0,
      availability: "available"
    }
  ];

  const reports = [
    {
      _id: "1",
      need_type: "water",
      severity: 8,
      people_affected: 120,
      location: { address: "Punjabi Bagh" }
    }
  ];

  const report = reports.find(r => r._id === reportId);

  if (!report) {
    return res.status(404).json({
      success: false,
      message: "Report not found"
    });
  }

  // scoring logic
  const scored = volunteers.map(v => {
    let score = 0;

    if (v.skills.includes(report.need_type)) score += 50;
    if (v.location === report.location.address) score += 20;
    if (v.availability === "available") score += 15;
    score += v.rating * 2;
    score += report.severity;

    return { ...v, match_score: score };
  });

  scored.sort((a, b) => b.match_score - a.match_score);

  const best = scored[0];

  const assignment = {
    id: Date.now().toString(),
    report_id: reportId,
    volunteer_id: best._id,
    status: "assigned",
    assigned_at: new Date()
  };

  assignments.push(assignment);

  res.json({
    success: true,
    message: "Auto-assigned best volunteer",
    assigned_to: best.name,
    score: best.match_score,
    data: assignment
  });
});


// UPDATE STATUS
router.patch("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["assigned", "in_progress", "completed"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value"
    });
  }

  const assignment = assignments.find(a => a.id === id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: "Assignment not found"
    });
  }

  assignment.status = status;

  res.json({
    success: true,
    message: "Status updated successfully",
    data: assignment
  });
});






module.exports = router;