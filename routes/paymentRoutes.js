const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');

// GET form pembayaran
router.get('/:id', paymentController.getPembayaran);

// POST update metode pembayaran
router.post('/:id', paymentController.postPembayaran);



module.exports = router;
