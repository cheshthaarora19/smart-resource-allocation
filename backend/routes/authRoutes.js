const express = require('express');
const router = express.Router();

// TODO: Add authentication routes (Feature 5)
router.get('/test', (req, res) => {
  res.json({ message: 'Authentication routes working' });
});

module.exports = router;