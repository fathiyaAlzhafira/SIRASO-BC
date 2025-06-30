// Middleware untuk autentikasi penjual
const authPenjual = (req, res, next) => {
  // Cek apakah user sudah login sebagai penjual
  if (req.session && req.session.seller) {
    next(); // Lanjutkan ke route berikutnya
  } else {
    // Jika belum login, redirect ke halaman login penjual
    res.redirect('/penjual/login');
  }
};

module.exports = authPenjual;
