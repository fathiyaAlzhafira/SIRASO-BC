const prisma = require('../prisma/generated/client'); // Impor Prisma Client

// Fungsi untuk menangani proses registrasi
exports.register = async (req, res) => {
  const { fullname, username, phone, password, status, alamat, email } = req.body;

  try {
    // Membuat user baru di database
    const newUser = await prisma.user.create({
      data: {
        fullname,
        username,
        phone,
        password, // Anda bisa mengenkripsi password menggunakan bcrypt sebelum menyimpan
        status,
        alamat,
        email
      }
    });

    // Setelah registrasi sukses, redirect ke halaman login
    res.redirect('/users/login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Terjadi kesalahan saat mendaftar');
  }
};
