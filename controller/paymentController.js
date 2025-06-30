const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tampilkan halaman pembayaran
exports.getPembayaran = async (req, res) => {
  const transactionId = parseInt(req.params.id);

  try {
    const transaksi = await prisma.transactions.findUnique({
      where: { transaction_id: transactionId },
      include: {
        user: true,
        transaction_items: {
          include: {
            menu: true
          }
        },
        pickupschedule: true
      }
    });

    if (!transaksi) {
      return res.status(404).send("Transaksi tidak ditemukan");
    }

    // Ambil data pesanan dari transaction_items
    const items = transaksi.transaction_items.map(item => ({
      menu: item.menu,
      jumlah: item.jumlah,
      subtotal: item.subtotal
    }));

    const totalPrice = transaksi.total_price;

    res.render('pembayaran', { 
      transaksi,
      items,
      totalPrice
    });
  } catch (err) {
    console.error("Gagal ambil data pembayaran:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Proses update metode pembayaran
exports.postPembayaran = async (req, res) => {
  const transactionId = parseInt(req.params.id);
  const metode = req.body.metode_pembayaran;

  try {
    await prisma.transactions.update({
      where: { transaction_id: transactionId },
      data: {
        metode_pembayaran: metode,
        status_pembayaran: 'Menunggu Konfirmasi',
      },
    });

    // Redirect ke halaman status pengambilan pesanan
    res.redirect(`/status-pengambilan?id=${transactionId}`);
  } catch (err) {
    console.error("Gagal update metode pembayaran:", err);
    res.status(500).send("Gagal menyimpan metode pembayaran");
  }
};
