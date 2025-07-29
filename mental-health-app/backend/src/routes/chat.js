const express = require('express');
const router = express.Router();

router.get('/conversations', (req, res) => {
  res.json({ success: true, message: 'Chat routes - Coming soon!' });
});

module.exports = router;