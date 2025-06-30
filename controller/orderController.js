const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getRingkasanPesanan = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/login');
    const userId = req.session.user.user_id;
    const keranjang = await req.prisma.keranjang.findMany({
      where: { user_id: userId },
      include: { menu: true },
    });
    
    if (keranjang.length === 0) {
      // Cek apakah ada transaksi terbaru yang sudah dibayar
      const transaksiTerbaru = await req.prisma.transactions.findFirst({
        where: { 
          user_id: userId,
          status_pembayaran: 'Menunggu Konfirmasi'
        },
        orderBy: { tanggal_transaksi: 'desc' },
        include: {
          transaction_items: {
            include: {
              menu: true
            }
          }
        }
      });

      if (transaksiTerbaru) {
        // Jika ada transaksi terbaru, tampilkan konfirmasi pembayaran berhasil
        return res.render('ringkasan', { 
          pesanan: [], 
          total: 0, 
          metodePembayaran: transaksiTerbaru.metode_pembayaran, 
          kodeDiskon: transaksiTerbaru.kode_diskon,
          transaksiTerbaru 
        });
      } else {
        // Jika tidak ada transaksi, tampilkan pesan keranjang kosong
        return res.status(404).render('ringkasan', { 
          pesanan: [], 
          total: 0, 
          metodePembayaran: '', 
          kodeDiskon: '' 
        });
      }
    }

    const pesanan = keranjang.map((item) => {
      const harga = parseFloat(item.menu.harga);
      const subtotal = harga * item.jumlah;
      return { nama_makanan: item.menu.nama_makanan, jumlah: item.jumlah, harga, subtotal };
    });
    const total = pesanan.reduce((sum, item) => sum + item.subtotal, 0);
    const transaksi = await req.prisma.transactions.findFirst({
      where: { user_id: userId },
      orderBy: { tanggal_transaksi: 'desc' },
    });
    const metodePembayaran = transaksi ? transaksi.metode_pembayaran : '';
    const kodeDiskon = transaksi ? transaksi.kode_diskon : null;
    res.render('ringkasan', { pesanan, total, metodePembayaran, kodeDiskon });
  } catch (err) {
    console.error('Gagal ambil ringkasan:', err);
    res.status(500).render('error', { error: 'Terjadi kesalahan saat mengambil ringkasan pembayaran' });
  }
};

// Fungsi baru untuk membuat transaksi dari keranjang
exports.createTransactionFromCart = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
    }

    const userId = req.session.user.user_id;
    const { waktuPengambilan, metodePembayaran } = req.body;
    
    // Ambil data keranjang user
    const keranjang = await req.prisma.keranjang.findMany({
      where: { user_id: userId },
      include: { menu: true },
    });

    if (keranjang.length === 0) {
      return res.status(400).json({ success: false, message: 'Keranjang kosong' });
    }

    // Hitung total harga
    const total = keranjang.reduce((sum, item) => {
      return sum + (parseFloat(item.menu.harga) * item.jumlah);
    }, 0);

    // Buat transaksi baru
    const transaksi = await req.prisma.transactions.create({
      data: {
        user_id: userId,
        total_price: total,
        metode_pembayaran: metodePembayaran || 'Belum dipilih',
        status_pembayaran: 'Menunggu',
        status: 'Menunggu',
        tanggal_transaksi: new Date(),
      },
    });

    // Simpan item transaksi ke database
    for (const item of keranjang) {
      await req.prisma.transaction_items.create({
        data: {
          transaction_id: transaksi.transaction_id,
          menu_id: item.menu_id,
          jumlah: item.jumlah,
          harga_satuan: item.menu.harga,
          subtotal: item.menu.harga * item.jumlah,
        },
      });
    }

    // Kurangi stok menu
for (const item of keranjang) {
  await req.prisma.menu.update({
    where: { menu_id: item.menu_id },
    data: {
      stok: {
        decrement: item.jumlah
      }
    }
  });
}

    // Buat jadwal pengambilan dengan nomor antrian
    const nomorAntrian = await generateNomorAntrian(req.prisma);
    const waktuEstimasi = new Date(waktuPengambilan);
    waktuEstimasi.setMinutes(waktuEstimasi.getMinutes() + 15); // Estimasi 15 menit

    await req.prisma.pickupschedule.create({
      data: {
        transaction_id: transaksi.transaction_id,
        waktu_pengambilan: new Date(waktuPengambilan),
        waktu_estimasi: waktuEstimasi,
        status_pengambilan: false,
        nomor_antrian: nomorAntrian,
      },
    });

    // Kosongkan keranjang setelah transaksi dibuat
    await req.prisma.keranjang.deleteMany({
      where: { user_id: userId },
    });

    res.json({ 
      success: true, 
      message: 'Transaksi berhasil dibuat', 
      transactionId: transaksi.transaction_id,
      nomorAntrian: nomorAntrian
    });
  } catch (err) {
    console.error('Gagal membuat transaksi:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat membuat transaksi' });
  }
};

// Fungsi untuk generate nomor antrian
async function generateNomorAntrian(prisma) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const count = await prisma.pickupschedule.count({
    where: {
      waktu_pengambilan: {
        gte: today,
        lt: tomorrow
      }
    }
  });
  
  return count + 1;
}

// Fungsi untuk mendapatkan status pengambilan
exports.getStatusPengambilan = async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    
    const pickupSchedule = await req.prisma.pickupschedule.findUnique({
      where: { transaction_id: transactionId },
      include: {
        transactions: {
          include: {
            user: true,
            transaction_items: {
              include: {
                menu: true
              }
            }
          }
        }
      }
    });

    if (!pickupSchedule) {
      return res.status(404).json({ success: false, message: 'Jadwal pengambilan tidak ditemukan' });
    }

    res.json({
      success: true,
      data: {
        nomorAntrian: pickupSchedule.nomor_antrian,
        waktuPengambilan: pickupSchedule.waktu_pengambilan,
        waktuEstimasi: pickupSchedule.waktu_estimasi,
        statusPengambilan: pickupSchedule.status_pengambilan,
        transaksi: pickupSchedule.transactions
      }
    });
  } catch (err) {
    console.error('Gagal ambil status pengambilan:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil status pengambilan' });
  }
};

exports.getOrderDetail = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  try {
    const menu = await req.prisma.menu.findUnique({
      where: { menu_id: parseInt(req.params.id) },
      include: { toko: true },
    });
    if (!menu) {
      return res.status(404).render('error', { message: 'Menu tidak ditemukan' });
    }
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    res.render('detailPesanan', { title: `Pesan ${menu.nama_makanan}`, menu, user: req.session.user, formatPrice });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { error });
  }
};
