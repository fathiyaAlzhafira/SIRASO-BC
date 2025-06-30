const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// exports.getHistory = async (req, res) => {
//   try {
//     const transaksi = await prisma.transactions.findMany({
//       orderBy: { tanggal_transaksi: 'desc' },
//       include: {
//         user: true,
//         pickupschedule: true,
//         refundrequests: true,
//         transaction_items: {
//           include: {
//             menu: true
//           }
//         }
//       },
//     });
exports.getHistory = async (req, res) => {
  try {
    const userId = req.session.user?.user_id;

    if (!userId) {
      return res.redirect('/login'); // Redirect jika belum login
    }

    const transaksi = await prisma.transactions.findMany({
  where: {
    user_id: userId
  },
  orderBy: { tanggal_transaksi: 'desc' },
  include: {
    user: true,
    pickupschedule: true,
    refundrequests: true,
    transaction_items: {
      include: {
        menu: true
      }
    }
  },
});

    res.render('history', { transaksi });
  } catch (err) {
    console.error('Gagal ambil history:', err);
    res.status(500).send("Gagal mengambil riwayat transaksi.");
  }
};

// Fungsi untuk menghapus seluruh riwayat transaksi user
exports.deleteAllHistory = async (req, res) => {
  try {
    const userId = req.session.user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
    }

    // Hapus semua data terkait transaksi user secara berurutan
    // 1. Hapus refund requests
    await prisma.refundrequests.deleteMany({
      where: { user_id: userId }
    });

    // 2. Hapus pickup schedules
    await prisma.pickupschedule.deleteMany({
      where: {
        transaction: {
          user_id: userId
        }
      }
    });

    // 3. Hapus transaction items
    await prisma.transaction_items.deleteMany({
      where: {
        transaction: {
          user_id: userId
        }
      }
    });

    // 4. Hapus transactions
    await prisma.transactions.deleteMany({
      where: { user_id: userId }
    });

    res.json({ success: true, message: 'Seluruh riwayat transaksi berhasil dihapus' });
  } catch (err) {
    console.error('Gagal hapus history:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus riwayat transaksi' });
  }
};
