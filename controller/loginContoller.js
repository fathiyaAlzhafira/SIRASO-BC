const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

// Fungsi untuk login
const loginUser = async (req, res) => {
  // Validasi form input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', { error: errors.array().map(err => err.msg).join(", ") }); // Menampilkan semua error
  }

  const { email, password } = req.body;

  try {
    // Cari user berdasarkan email
    const user = await req.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.render('login', { error: 'Email tidak ditemukan' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.render('login', { error: 'Password salah' });
    }
    req.session.user = user;
    res.redirect('/home');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).render('login', { error: 'Terjadi kesalahan pada server.' });
  }
};

module.exports = { loginUser };
