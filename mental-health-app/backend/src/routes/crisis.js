const express = require('express');
const router = express.Router();

router.get('/resources', (req, res) => {
  res.json({ success: true, message: 'Crisis routes - Coming soon!' });
});

module.exports = router;