const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const authUser = require('../middleware/authUser'); // Import middleware

const PDFDocument = require('pdfkit');
const fs = require('fs');

// Halaman login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Proses login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await req.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.render('login', { error: 'Email tidak ditemukan' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { error: 'Password salah' });
    }
    req.session.user = user;
    res.redirect('/home');
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).render('login', { error: 'Terjadi kesalahan pada server.' });
  }
});

// GET route for the home page
router.get('/home', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  try {
    const tokos = await req.prisma.toko.findMany();
    res.render('home', {
      user: req.session.user,
      tokos,
      currentToko: null,
      menus: [],
      formatPrice: (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
    });
  } catch (error) {
    res.status(500).render('error', { message: 'Terjadi kesalahan saat memuat data', error });
  }
});

// Rute untuk halaman pencarian
router.get('/pencarian', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('pencarian', { user: req.session.user });
});

// Halaman All
router.get('/All', function(req, res, next) {
  res.render('All');
});

// Halaman kategori
router.get('/kategori', function(req, res, next) {
  res.render('kategori');
});

// Halaman jenis
router.get('/jenis', function(req, res, next) {
  res.render('jenis');
});

// Halaman rentang_harga
router.get('/rentang_harga', function(req, res, next) {
  res.render('rentang_harga');
});

// Halaman rating
router.get('/rating', function(req, res, next) {
  res.render('rating');
});

// Halaman populer
router.get('/populer', function(req, res, next) {
  res.render('populer');
});

// Halaman download_menu
router.get('/download_menu', function(req, res, next) {
  res.render('download_menu');
});

// Register page
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Process register
router.post('/register', async (req, res) => {
  const { fullname, username, phone, password, status, alamat, email } = req.body;
  try {
    const existingUser = await req.prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.render('register', { error: 'Username sudah digunakan' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await req.prisma.user.create({
      data: { fullname, username, phone, password: hashedPassword, status, alamat, email },
    });
    res.redirect('/login');
  } catch (err) {
    console.error('Error during register:', err);
    res.status(500).render('register', { error: 'Terjadi kesalahan pada server.' });
  }
});

// Rute untuk halaman pesanan
router.get('/pesanan', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  try {
    const keranjang = await req.prisma.keranjang.findMany({
      where: { user_id: req.session.user.user_id },
      include: { menu: true }
    });
    res.render('pesanan', { items: keranjang, user: req.session.user });
  } catch (error) {
    res.status(500).render('error', { error });
  }
});

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

router.post('/keranjang', async (req, res) => {
    const { userId, menuId, jumlah, waktuPengambilan } = req.body;

    try {
    // menambahkan makanan dalam keranjang
        const keranjang = await req.prisma.keranjang.create({
            data: {
                userId: userId,
                menuId: menuId,
                jumlah: jumlah,
                waktuPengambilan: new Date (waktuPengambilan),
            },
        });
        res.json(keranjang); // Mengembalikan data keranjang yang baru dibuat
    } catch (error) {
      res.status(500).json({ error: 'Gagal menambahkan makanan ke keranjang' });
    }
});

router.post('/transaksi', async (req, res) => {
    const { userId, keranjangIds } = req.body;

    try {
      const transaksi = await req.prisma.transaction.create({
        data: {
          user_id:userId, 
          status: 'dipesan',
        },
      });

      // menambahkan item ke transaksi
      for (const keranjangId of keranjangIds) {
            const keranjang = await req.prisma.keranjang.findUnique({ where: { keranjang_id: keranjangId } });
            
            await req.prisma.detail_transaksi.create({
                data: {
                    transaksi_id: transaksi.transaction_id,
                    menu_id: keranjang.menu_id,
                    jumlah: keranjang.jumlah,
                    harga: keranjang.jumlah * (await req.prisma.menu.findUnique({ where: { menu_id: keranjang.menu_id } })).harga,
                },
            });
        }
        
        res.json({ message: 'Transaksi berhasil diproses', transaksi });
    } catch (error) {
        res.status(500).json({ error: 'Gagal memproses transaksi' });
    }
});

// Memeriksa status pesanan
router.get('/status/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    
    try {
        const transaksi = await req.prisma.transactions.findUnique({
            where: { transaction_id: parseInt(transactionId) },
            include: {
                detail_transaksi: true, // Menampilkan detail transaksi (makanan yang dipesan)
            },
        });
        
        if (!transaksi) {
            return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
        }
        
        res.json({
            status: transaksi.status,
            nomor_antrian: transaksi.nomor_antrian, // Anda bisa menambahkan logika untuk nomor antrian
            detail_transaksi: transaksi.detail_transaksi,
        });
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil status pesanan' });
    }
});

// Menggenerate PDF untuk pesanan
router.get('/generate-pdf/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    
    try {          
        const transaksi = await req.prisma.transactions.findUnique({
            where: { transaction_id: parseInt(transactionId) },
            include: { pickup_schedule: true },

        });
        
        if (!transaksi) {
            return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
        }

        const doc = new PDFDocument();
        const filePath = `./public/pesanan_${transactionId}.pdf`;
        doc.pipe(fs.createWriteStream(filePath));
        
        doc.fontSize(12).text(`Pesanan ID: ${transaksi.transaction_id}`);
        doc.text(`Status: ${transaksi.status_pembayaran}`);
        doc.text(`Total Harga: ${transaksi.total_price}`);
        if (transaksi.pickup_schedule) {
            doc.text(`Waktu Pengambilan: ${transaksi.pickup_schedule.waktu_pengambilan}`);
            doc.text(`Nomor Antrian: ${transaksi.pickup_schedule.nomor_antrian}`);
        }
        
        doc.end();
        
        res.json({ message: 'PDF berhasil dibuat', filePath });
    } catch (error) {
        res.status(500).json({ error: 'Gagal membuat PDF' });
    }
});

router.post('/pesanan', async (req, res) => {
  res.render('pesanan', { user: req.session.user }); // Render halaman pesanan dengan data user
});

// Keranjang (Pesanan Saya) - protected
router.get('/keranjang', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  try {
    const keranjang = await req.prisma.keranjang.findMany({
      where: { user_id: req.session.user.user_id },
      include: { menu: true }
    });
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    res.render('keranjang', { title: 'Keranjang Belanja', items: keranjang, formatPrice });
  } catch (error) {
    res.status(500).render('error', { error });
  }
});

// Pembayaran (Ringkasan) - protected
router.get('/pembayaran', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  // Dummy data, sesuaikan dengan transaksi user
  res.render('ringkasan', { pesanan: [], total: 0, metodePembayaran: '', kodeDiskon: '' });
});

// Rute untuk halaman status pengambilan
router.get('/status-pengambilan', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('statusPengambilan', { user: req.session.user });
});

// Redirect root to login
router.get('/', (req, res) => {
  res.redirect('/login');
});

module.exports = router;
