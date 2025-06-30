const bcrypt = require('bcrypt');
const User = require('@prisma/client'); // Sesuaikan dengan model Prisma Anda
const { PrismaClient } = User;


exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cari user berdasarkan username/email
    const user = await User.findUnique({
      where: { username: username }, // Atau bisa email jika menggunakan email
    });

    if (!user) {
      return res.render('login', { error: 'Username tidak ditemukan' }); // Jika user tidak ditemukan
    }

    // Verifikasi password (gunakan bcrypt untuk membandingkan hash password)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.render('login', { error: 'Password salah' }); // Jika password salah
    }

    // Jika login berhasil, simpan user di session
    req.session.user = user; // Menyimpan user di session

    // Redirect ke halaman dashboard atau halaman yang diinginkan setelah login
    res.redirect('/home'); // Ganti dengan halaman yang sesuai setelah login

  } catch (error) {
    console.error(error);
    res.status(500).send('Terjadi kesalahan pada server'); // Menangani error server
  }
};
