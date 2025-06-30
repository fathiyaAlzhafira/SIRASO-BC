const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Render dashboard penjual
const renderDashboard = async (req, res) => {
  try {
    // Get statistics for dashboard
    // const totalMenu = await prisma.menu.count({
    //   where: { toko_id: 1 } // Assuming seller has toko_id = 1
    // });
    const tokoId = req.session.seller.toko_id;

const totalMenu = await prisma.menu.count({
  where: { toko_id: tokoId }
});

    const menuTersedia = await prisma.menu.count({
      where: { 
        toko_id: tokoId,
        stok: { gt: 0 }
      }
    });

    const stokHabis = await prisma.menu.count({
      where: { 
        toko_id: tokoId,
        stok: 0
      }
    });

    // Get recent transactions
    const recentTransactions = await prisma.transactions.findMany({
      take: 5,
      orderBy: { tanggal_transaksi: 'desc' },
      include: { 
        user: true,
        transaction_items: {
          include: {
            menu: true
          }
        }
      }
    });

    // Filter transactions that have items from this seller's store
    const filteredTransactions = recentTransactions.filter(trx => 
      trx.transaction_items.some(item => item.menu.toko_id === tokoId)
    );

    // Get total revenue (simplified calculation)
    // const totalRevenue = await prisma.transactions.aggregate({
    //   _sum: { total_price: true }
    // });
    // Ambil semua transaksi yang mengandung item dari berbagai toko
const semuaTransaksi = await prisma.transactions.findMany({
  include: {
    transaction_items: {
      include: {
        menu: true
      }
    }
  }
});

// Hitung hanya transaksi dari toko ini
const totalPendapatan = semuaTransaksi.reduce((sum, trx) => {
  // Ambil item transaksi yang berasal dari toko penjual saat ini
  const itemsTokoIni = trx.transaction_items.filter(item => item.menu.toko_id === tokoId);

  // Hitung subtotal hanya dari item toko ini
  const subtotal = itemsTokoIni.reduce((sub, item) => sub + item.subtotal, 0);

  return sum + subtotal;
}, 0);


    res.render('penjual/dashboardpenjual', {
      activePage: 'dashboard',
      stats: {
        totalMenu,
        menuTersedia,
        stokHabis,
        // totalRevenue: totalRevenue._sum.total_price || 0
        totalRevenue: totalPendapatan
      },
      recentTransactions: filteredTransactions
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Gagal memuat dashboard');
  }
};

module.exports = {
  renderDashboard
};