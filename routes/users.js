const express = require('express');
const router = express.Router();
const { registerUser } = require('../controller/registerController'); // Mengimpor controller untuk registrasi
const bcrypt = require('bcrypt');

// Rute GET untuk halaman Register
router.get('/register', (req, res) => {
  res.render('register', { error: null }); // Menampilkan halaman registrasi
});

// Rute POST untuk registrasi
router.post('/register', registerUser); // Memanggil controller register untuk proses registrasi

router.get('/menu', async (req, res) => {
    try {
        const Menu = await req.prisma.menu.findMany();
        console.log(Menu); // Menampilkan data menu di console untuk debugging
        res.json(Menu);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil menu' });
    }
});

module.exports = router;
