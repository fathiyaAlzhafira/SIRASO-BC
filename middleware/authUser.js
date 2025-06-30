// middleware/authUser.js
module.exports = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login'); // Redirect kalau belum login
    }
    next(); // Lanjut ke route berikutnya kalau sudah login
  };