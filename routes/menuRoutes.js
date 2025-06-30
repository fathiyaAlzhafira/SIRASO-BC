const express = require('express');
const router = express.Router();
const menuController = require('../controller/menuController');

// Route untuk mendapatkan semua menu dengan filter
router.get('/', menuController.getMenu);

// Route untuk mendapatkan menu berdasarkan kategori
router.get('/kategori/:kategori', menuController.getMenuByKategori);

// Route untuk mendapatkan menu populer
router.get('/populer', menuController.getMenuPopuler);

// Route untuk mendapatkan menu berdasarkan rating
router.get('/rating', menuController.getMenuByRating);

// Route untuk mendapatkan daftar warung
router.get('/warung', menuController.getDaftarWarung);

// Route untuk generate PDF menu warung
router.get('/pdf/:tokoId', menuController.generateMenuPDF);

// Route untuk mendapatkan menu berdasarkan toko
router.get('/toko/:tokoId', menuController.getMenuByToko);

// Route untuk filter menu berdasarkan kategori dan toko
router.get('/filter/:tokoId/:category', menuController.filterMenuByCategory);

module.exports = router;