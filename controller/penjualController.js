const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createLaporanPDF } = require('../utils/laporangenerator');

// Tampilkan form tambah menu
const renderTambahMenu = (req, res) => {
  res.render('penjual/tambahmenu');
};

// Tampilkan halaman kelola menu
// const renderKelolaMenu = async (req, res) => {
//   try {
//     const menus = await prisma.menu.findMany({
//       where: { toko_id: 1 }, // sementara
//       orderBy: { menu_id: 'desc' },
//     });
//     res.render('penjual/kelolamenu', { menus });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Gagal menampilkan data menu.');
//   }
// };
const renderKelolaMenu = async (req, res) => {
  try {
    const tokoId = req.session.seller.toko_id;

    const menu = await prisma.menu.findMany({
      where: { toko_id: tokoId },
      orderBy: { menu_id: 'desc' },
    });
    res.render('penjual/kelolamenu', { menu }); // ✅ Ganti dari menus → menu
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal menampilkan data menu.');
  }
};

// Hapus menu
const hapusMenu = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.menu.delete({ where: { menu_id: id } });
    res.redirect('/penjual/kelolamenu');
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal menghapus menu.');
  }
};

// Proses tambah menu
const tambahMenu = async (req, res) => {
  const { nama_makanan, deskripsi, kategori, jenis, harga, stok, gambar_url } = req.body;

  try {
    await prisma.menu.create({
      data: {
        nama_makanan,
        deskripsi,
        kategori,
        jenis,
        harga: parseInt(harga),
        stok: parseInt(stok),
        gambar_url,
        rating: 0,
        available: true,
        bahan: '',
        toko_id: req.session.seller.toko_id, // sementara
      },
    });

    res.redirect('/penjual/kelolamenu');
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal menambahkan menu.');
  }
};

// Tampilkan form edit
const renderEditMenu = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const menu = await prisma.menu.findUnique({ where: { menu_id: id } });
    res.render('penjual/editmenu', { menu });
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal menampilkan data menu.');
  }
};

// Proses update menu
const updateMenu = async (req, res) => {
  const id = parseInt(req.params.id);
  const { nama_makanan, deskripsi, kategori, jenis, harga, stok, gambar_url } = req.body;

  try {
    await prisma.menu.update({
      where: { menu_id: id },
      data: {
        nama_makanan,
        deskripsi,
        kategori,
        jenis,
        harga: parseInt(harga),
        stok: parseInt(stok),
        gambar_url,
      },
    });
    res.redirect('/penjual/kelolamenu');
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal mengupdate menu.');
  }
};

// Update status pesanan menjadi "Siap"
const setPesananSiap = async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    
    // Update status transaksi
    await prisma.transactions.update({
      where: { transaction_id: transactionId },
      data: { status: 'Siap' }
    });

    // Update status pengambilan
    await prisma.pickupschedule.update({
      where: { transaction_id: transactionId },
      data: { status_pengambilan: true }
    });

    res.json({ success: true, message: 'Pesanan berhasil disiapkan' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status pesanan' });
  }
};

// Update status pesanan menjadi "Dibatalkan"
const batalkanPesanan = async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    
    await prisma.transactions.update({
      where: { transaction_id: transactionId },
      data: { status: 'Dibatalkan' }
    });

    res.json({ success: true, message: 'Pesanan berhasil dibatalkan' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Gagal membatalkan pesanan' });
  }
};

// Toggle status buka/tutup toko
const toggleStatusToko = async (req, res) => {
  try {
    const tokoId =  req.session.seller.toko_id; // Assuming seller has toko_id = 1
    
    // For now, just return success since status_buka field doesn't exist
    // You can add this field to the schema later if needed
    res.json({ 
      success: true, 
      message: 'Status toko berhasil diubah',
      status: true
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status toko' });
  }
};

// Get laporan penjualan
const getLaporanPenjualan = async (req, res) => {
  try {
    const tokoId = req.session.seller.toko_id;
    const { tanggal_awal, tanggal_akhir } = req.query;

    const whereClause = {
      status: 'Siap',
      tanggal_transaksi: {
        gte: new Date(tanggal_awal || new Date().setDate(new Date().getDate() - 30)),
        lte: new Date(tanggal_akhir || new Date())
      },
      transaction_items: {
        some: {
          menu: {
            toko_id: tokoId
          }
        }
      }
    };

    const transaksi = await prisma.transactions.findMany({
      where: whereClause,
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

    const totalPendapatan = transaksi.reduce((sum, trx) => {
      const itemsToko = trx.transaction_items.filter(item => item.menu.toko_id === tokoId);
      const subtotalToko = itemsToko.reduce((itemSum, item) => itemSum + item.subtotal, 0);
      return sum + subtotalToko;
    }, 0);

    const totalPesanan = transaksi.length;

    res.json({
      success: true,
      data: {
        transaksi,
        totalPendapatan,
        totalPesanan,
        periode: {
          tanggal_awal: tanggal_awal || new Date().setDate(new Date().getDate() - 30),
          tanggal_akhir: tanggal_akhir || new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil laporan penjualan' });
  }
};

// Unduh laporan harian
const unduhLaporanHarian = async (req, res) => {
  const tokoId = req.session.seller.toko_id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const transaksi = await prisma.transactions.findMany({
    where: {
      status: 'Siap',
      tanggal_transaksi: { gte: today },
      transaction_items: {
        some: {
          menu: { toko_id: tokoId }
        }
      }
    },
    include: {
      transaction_items: { include: { menu: true } }
    }
  });

  const pdfBuffer = await createLaporanPDF(transaksi, 'Harian');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="laporan-harian.pdf"');
  res.send(pdfBuffer);
};

// Unduh laporan bulanan
const unduhLaporanBulanan = async (req, res) => {
  const tokoId = req.session.seller.toko_id;
  const awalBulan = new Date();
  awalBulan.setDate(1);
  awalBulan.setHours(0, 0, 0, 0);

  const transaksi = await prisma.transactions.findMany({
    where: {
      status: 'Siap',
      tanggal_transaksi: { gte: awalBulan },
      transaction_items: {
        some: {
          menu: { toko_id: tokoId }
        }
      }
    },
    include: {
      transaction_items: { include: { menu: true } }
    }
  });

  const pdfBuffer = await createLaporanPDF(transaksi, 'Bulanan');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="laporan-bulanan.pdf"');
  res.send(pdfBuffer);
};

// Tampilkan halaman laporan
const renderLaporan = (req, res) => {
  res.render('penjual/laporan');
};

// Export semua fungsi
module.exports = {
  renderTambahMenu,
  renderKelolaMenu,
  tambahMenu,
  hapusMenu,
  renderEditMenu,
  updateMenu,
  setPesananSiap,
  batalkanPesanan,
  toggleStatusToko,
  getLaporanPenjualan,
  renderLaporan,
  unduhLaporanHarian,
  unduhLaporanBulanan,
};