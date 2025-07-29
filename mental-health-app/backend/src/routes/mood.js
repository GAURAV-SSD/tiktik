const express = require('express');
const router = express.Router();

router.get('/entries', (req, res) => {
  res.json({ success: true, message: 'Mood routes - Coming soon!' });
});

module.exports = router;