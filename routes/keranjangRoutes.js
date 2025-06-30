const express = require('express');
const router = express.Router();
const keranjangController = require('../controller/keranjangController');

router.get('/', keranjangController.getKeranjangByUser);
router.post('/add', keranjangController.addToKeranjang);
router.put('/:keranjang_id', keranjangController.updateKeranjangItem);
router.delete('/clear', keranjangController.clearKeranjang);
router.delete('/:keranjang_id', keranjangController.deleteKeranjangItem);

module.exports = router;