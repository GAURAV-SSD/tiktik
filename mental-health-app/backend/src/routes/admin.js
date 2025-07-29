const express = require('express');
const router = express.Router();

router.get('/users', (req, res) => {
  res.json({ success: true, message: 'Admin routes - Coming soon!' });
});

module.exports = router;