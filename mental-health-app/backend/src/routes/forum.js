const express = require('express');
const router = express.Router();

// Placeholder routes - will be implemented later
router.get('/posts', (req, res) => {
  res.json({ success: true, message: 'Forum routes - Coming soon!' });
});

module.exports = router;