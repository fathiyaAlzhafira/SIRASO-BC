const express = require('express');
const router = express.Router();
const { loginUser } = require('/controller/loginController');

// Menghandle request POST untuk login
router.post('/login', loginUser);

module.exports = router;
