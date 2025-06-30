const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const penjualController = require('../controller/penjualController');
const dashboardPenjualController = require('../controller/dashboardPenjualController');
const authPenjual = require('../middleware/authPenjual');

// GET: Tampilkan form login penjual
router.get('/login', (req, res) => {
  res.render('penjual/loginPenjual', { error: null });
});

// Halaman laporan
router.get('/laporan', authPenjual, penjualController.renderLaporan);

// Unduh laporan harian & bulanan
router.get('/laporan/harian', authPenjual, penjualController.unduhLaporanHarian);
router.get('/laporan/bulanan', authPenjual, penjualController.unduhLaporanBulanan);

// // POST: Proses login penjual
// router.post('/login', async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const seller = await prisma.seller.findUnique({ where: { username } });

//     if (!seller || seller.password !== password) {
//       return res.render('penjual/loginPenjual', { error: 'Username atau password salah' });
//     }

//     req.session.seller = seller; // Set session penjual
//     res.redirect('/penjual/dashboard');
//   } catch (err) {
//     console.error('Login error:', err);
//     res.status(500).send('Terjadi kesalahan saat login');
//   }
// });
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const seller = await prisma.seller.findUnique({ where: { username } });

    if (!seller || seller.password !== password) {
      return res.render('penjual/loginPenjual', { error: 'Username atau password salah' });
    }

    req.session.seller = {
      seller_id: seller.seller_id,
      username: seller.username,
      toko_id: seller.toko_id
    };

    res.redirect('/penjual/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Terjadi kesalahan saat login');
  }
});

// POST: Logout penjual
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/penjual/login');
  });
});

// GET: Dashboard penjual (dilindungi middleware)
router.get('/dashboard', authPenjual, dashboardPenjualController.renderDashboard);

// ==== ROUTE PESANAN (dari pesananP.js) ====
router.get('/pesanan', authPenjual, async (req, res) => {
  try {
    const tokoId = 1;

    const semuaTransaksi = await prisma.transactions.findMany({
      include: { 
        user: true,
        transaction_items: {
          include: {
            menu: true
          }
        }
      },
      orderBy: { tanggal_transaksi: 'desc' }
    });

    const hasilTransaksi = [];

    for (let trx of semuaTransaksi) {
      // Filter item yang hanya dari toko ini
      const pesananMenu = trx.transaction_items.filter(item => 
        item.menu.toko_id === tokoId
      );

      if (pesananMenu.length > 0) {
        hasilTransaksi.push({
          ...trx,
          pesananMenu: pesananMenu
        });
      }
    }

    res.render('penjual/pesananP', {
      transaksi: hasilTransaksi,
      activePage: 'pesanan'
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal mengambil data transaksi');
  }
});

// ==== ROUTE KELOLA MENU (yang sudah kamu punya) ====
router.get('/kelolamenu', authPenjual, penjualController.renderKelolaMenu);
router.get('/tambahmenu', authPenjual, penjualController.renderTambahMenu);
router.post('/tambahmenu', authPenjual, penjualController.tambahMenu);
router.post('/hapusmenu/:id', authPenjual, penjualController.hapusMenu);
router.get('/editmenu/:id', authPenjual, penjualController.renderEditMenu);
router.post('/editmenu/:id', authPenjual, penjualController.updateMenu);

// router.get('/kelolamenu', async (req, res) => {
//   try {
//     const menu = await prisma.menu.findMany();
//     res.render('penjual/kelolamenu', { menu, activePage: 'kelolamenu' });
//   } catch (error) {
//     console.error("Gagal mengambil data menu:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// Route untuk mengelola pesanan
router.post('/pesanan/:id/siap', authPenjual, penjualController.setPesananSiap);
router.post('/pesanan/:id/batal', authPenjual, penjualController.batalkanPesanan);

// Route untuk toggle status toko
router.post('/toggle-status', authPenjual, penjualController.toggleStatusToko);

// Route untuk laporan penjualan
router.get('/laporan', authPenjual, penjualController.getLaporanPenjualan);

module.exports = router;
