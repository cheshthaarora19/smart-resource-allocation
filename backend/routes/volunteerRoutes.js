const express = require('express');
const router = express.Router();

// TODO: Add volunteer routes (Feature 6)
router.get('/test', (req, res) => {
  res.json({ message: 'Volunteer routes working' });
});

module.exports = router;