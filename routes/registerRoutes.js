const express = require('express');
const router = express.Router();
const { registerUser } = require('../controller/registerController');

// Menghandle request POST untuk registrasi
router.post('/register', registerUser);

module.exports = router;
