const express = require("express");
const router = express.Router();

// TEMP mock volunteers
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
  },
  {
    _id: "v3",
    name: "Sam",
    skills: ["teaching"],
    location: "Punjabi Bagh",
    rating: 3.8,
    availability: "busy"
  }
];

// TEMP mock reports (same as earlier)
const reports = [
  {
    _id: "1",
    need_type: "water",
    severity: 8,
    people_affected: 120,
    location: { address: "Punjabi Bagh" }
  },
  {
    _id: "2",
    need_type: "food",
    severity: 6,
    people_affected: 80,
    location: { address: "Rohini" }
  }
];

// Matching route
router.get("/:reportId", (req, res) => {
  const report = reports.find(r => r._id === req.params.reportId);

  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  const scored = volunteers.map(v => {
    let score = 0;

    // Skill match
    if (v.skills.includes(report.need_type)) score += 50;

    // Location match
    if (v.location === report.location.address) score += 20;

    // Availability
    if (v.availability === "available") score += 15;

    // Rating
    score += v.rating * 2;

    // Priority (simple)
    score += report.severity;

    return {
    ...v,
     match_score: score,
    explanation: {
    skill_match: v.skills.includes(report.need_type),
    location_match: v.location === report.location.address,
    available: v.availability === "available"
            }
        };
  });

  // Sort descending
  scored.sort((a, b) => b.match_score - a.match_score);

  res.json({
    report_id: report._id,
    matches: scored
  });
});

module.exports = router;