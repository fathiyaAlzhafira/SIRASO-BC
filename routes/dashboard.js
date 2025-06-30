// routes/dashboard.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('dashboardpenjual', { active: 'dashboard' }); // Pastikan file ini ada di views
});

module.exports = router;
