// routes/pesanan.js
const express = require('express');
const router = express.Router();

router.get('/pesanan', (req, res) => {
  res.render('pesanan', {
    foods: [],   // Kirim array kosong supaya tidak error di EJS
    total: 0     // Total 0
  });
});


module.exports = router;
