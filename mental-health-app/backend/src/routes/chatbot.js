const express = require('express');
const router = express.Router();

router.post('/conversation', (req, res) => {
  res.json({ success: true, message: 'Chatbot routes - Coming soon!' });
});

module.exports = router;