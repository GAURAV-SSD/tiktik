const express = require('express');
const router = express.Router();

// Placeholder routes - will be implemented later
router.get('/profile', (req, res) => {
  res.json({ success: true, message: 'Users routes - Coming soon!' });
});

module.exports = router;