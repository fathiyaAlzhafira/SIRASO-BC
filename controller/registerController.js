const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

// Fungsi untuk register user
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('register', { error: errors.array().map(e => e.msg).join(', ') });
  }

  const { fullname, username, phone, password, status, alamat, email } = req.body;

  try {
    // Validasi password
    const passwordStrength = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!password.match(passwordStrength)) {
      return res.status(400).render('register', { error: 'Password harus mengandung minimal 8 karakter, angka, dan huruf.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke database
    await req.prisma.user.create({
      data: {
        fullname,
        username,
        phone,
        password: hashedPassword,
        status,
        alamat,
        email,
      },
    });

    // Redirect ke halaman login setelah registrasi berhasil
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).render('register', { error: 'Terjadi kesalahan pada server.' });
  }
};

module.exports = { registerUser };
