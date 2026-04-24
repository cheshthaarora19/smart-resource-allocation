const express = require('express');
const router = express.Router();

// TODO: Add analytics routes (Feature 2, 4)
router.get('/test', (req, res) => {
  res.json({ message: 'Analytics routes working' });
});

module.exports = router;