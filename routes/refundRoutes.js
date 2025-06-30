const express = require('express');
const router = express.Router();
const refundController = require('../controller/refundController');
const multer = require('multer');

// Setup untuk file upload menggunakan multer
const upload = multer({ dest: 'uploads/' });  // Tentukan folder upload

// Route untuk menampilkan halaman form refund (GET)
router.get('/refund', (req, res) => {
    res.render('refund');  // pastikan file refund.ejs ada di dalam folder views
});

// Route untuk pengajuan refund (POST)
router.post('/refund', upload.single('bukti'), refundController.submitRefund);

// Route untuk halaman sukses (GET)
router.get('/refund/success', (req, res) => {
    res.render('success');  // Render halaman sukses setelah pengajuan refund
});

module.exports = router;
