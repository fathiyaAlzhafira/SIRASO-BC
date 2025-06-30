const express = require('express');
const router = express.Router();
const {
  getDetailPesanan,
  cetakBukti,
} = require('../controller/transaksiController');

// Rute untuk halaman detail pesanan
router.get('/pesanan/:id', getDetailPesanan);

// Rute untuk cetak bukti PDF
router.get('/pesanan/:id/cetak', cetakBukti);

module.exports = router;
