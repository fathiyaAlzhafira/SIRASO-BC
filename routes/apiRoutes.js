const express = require('express');
const router = express.Router();
const menuController = require('../controller/menuController');

// Route to get menus for a specific cafe, with optional category filter
router.get('/menus', menuController.getMenusApi);

module.exports = router; 