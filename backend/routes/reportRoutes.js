const express = require('express');
const router = express.Router();

// TODO: Add report routes (Feature 1, 3)
router.get('/test', (req, res) => {
  res.json({ message: 'Report routes working' });
});

module.exports = router;