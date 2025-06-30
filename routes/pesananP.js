const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tampilkan semua pesanan
router.get('/pesanan', async (req, res) => {
  try {
    const tokoId = 1;

    const semuaTransaksi = await prisma.transactions.findMany({
      include: {
        user: true
      },
      orderBy: {
        tanggal_transaksi: 'desc'
      }
    });

    const hasilTransaksi = [];

    for (let trx of semuaTransaksi) {
      const keranjang = await prisma.keranjang.findMany({
        where: {
          user_id: trx.user_id,
          menu: {
            toko_id: tokoId
          }
        },
        include: {
          menu: true
        }
      });

      if (keranjang.length > 0) {
        hasilTransaksi.push({
          ...trx,
          pesananMenu: keranjang
        });
      }
    }

    // res.render('penjual/pesananP', { transaksi: hasilTransaksi });
    res.render('penjual/pesananP', {
  transaksi: hasilTransaksi,
  activePage: 'pesanan'
});


  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal mengambil data transaksi');
  }
});

// Update status menjadi "Siap"
router.post('/pesanan/:id/siap', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.transactions.update({
      where: { transaction_id: id },
      data: { status: 'Siap' }
    });
    res.redirect('/penjual/pesanan');
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal ubah status jadi Siap');
  }
});

// Update status menjadi "Dibatalkan"
router.post('/pesanan/:id/batal', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.transactions.update({
      where: { transaction_id: id },
      data: { status: 'Dibatalkan' }
    });
    res.redirect('/penjual/pesanan');
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal ubah status jadi Dibatalkan');
  }
});


module.exports = router;
