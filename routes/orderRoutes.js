// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { getRingkasanPesanan, createTransactionFromCart, getStatusPengambilan } = require('../controller/orderController');
const orderController = require('../controller/orderController');

router.get('/selanjutnya', getRingkasanPesanan);
router.post('/create-transaction', createTransactionFromCart);
router.get('/status-pengambilan/:id', getStatusPengambilan);

// Route to get order detail page
router.get('/detail/:id', orderController.getOrderDetail);

module.exports = router;
