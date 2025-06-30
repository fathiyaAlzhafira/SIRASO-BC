const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const prisma = new PrismaClient();

exports.getDetailPesanan = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const transaksi = await prisma.transactions.findUnique({
      where: { transaction_id: id },
      include: {
        user: true,
        transaction_items: {
          include: {
            menu: true
          }
        }
      },
    });

    if (!transaksi) {
      return res.status(404).send('Transaksi tidak ditemukan');
    }

    const items = transaksi.transaction_items.map(item => ({
      menu: item.menu,
      jumlah: item.jumlah,
      subtotal: item.subtotal
    }));

    const biayaLayanan = 2000;
    const totalBayar = transaksi.total_price + biayaLayanan;

    res.render('detailPesanan', {
      transaksi,
      items,
      biayaLayanan,
      totalBayar,
    });
  } catch (err) {
    console.error('Gagal ambil detail pesanan:', err);
    res.status(500).send('Internal Server Error');
  }
};

exports.cetakBukti = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const transaksi = await prisma.transactions.findUnique({
      where: { transaction_id: id },
      include: {
        user: true,
        transaction_items: {
          include: {
            menu: true
          }
        }
      },
    });

    const items = transaksi.transaction_items.map(item => ({
      menu: item.menu,
      jumlah: item.jumlah,
      subtotal: item.subtotal
    }));

    const biayaLayanan = 2000;
    const totalBayar = transaksi.total_price + biayaLayanan;

    // Buat PDF
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res
        .writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=bukti_pesanan_${id}.pdf`,
          'Content-Length': pdfData.length,
        })
        .end(pdfData);
    });

    // Menyesuaikan desain PDF seperti gambar yang diberikan
    doc.fillColor('green')
      .fontSize(18)
      .text('BUKTI PEMBAYARAN', { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(12)
      .text(`No. Transaksi: #TRX${String(transaksi.transaction_id).padStart(3, '0')}`)
      .text(`Tanggal: ${transaksi.tanggal_transaksi.toLocaleString('id-ID')}`)
      .text(`Metode Pembayaran: ${transaksi.metode_pembayaran}`)
      .moveDown();

    // Ringkasan Pesanan
    doc.text('Ringkasan Pesanan:', { underline: true })
      .moveDown(0.5);

    // Menambahkan tabel item pesanan
    items.forEach((item) => {
      doc.text(`- ${item.jumlah}x ${item.menu.nama_makanan} = Rp ${item.subtotal.toLocaleString('id-ID')}`);
    });

    doc.moveDown();
    doc.text(`Biaya Layanan: Rp ${biayaLayanan.toLocaleString('id-ID')}`)
      .text(`Total Pembayaran: Rp ${totalBayar.toLocaleString('id-ID')}`)
      .moveDown();

    // Informasi Pelanggan
    doc.text('Informasi Pelanggan:', { underline: true })
      .moveDown(0.5)
      .text(`Nama: ${transaksi.user.fullname}`)
      .text(`Email: ${transaksi.user.email}`)
      .text(`Telepon: ${transaksi.user.phone}`)
      .text(`Alamat: ${transaksi.user.alamat}`)
      .moveDown();

    // Footer
    doc.fontSize(10)
      .text('Terima kasih telah berbelanja di SIRASO BC', { align: 'center' })
      .text('Universitas Andalas', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('Gagal cetak bukti:', err);
    res.status(500).send('Internal Server Error');
  }
};
