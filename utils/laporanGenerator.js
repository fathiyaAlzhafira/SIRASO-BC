const PDFDocument = require('pdfkit');

function createLaporanPDF(transaksi, jenis) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    doc.fontSize(18).text(`Laporan Pendapatan ${jenis}`, { align: 'center' });
    doc.moveDown();

    let total = 0;
    transaksi.forEach((trx, index) => {
      doc.fontSize(12).text(`${index + 1}. Transaksi #${trx.transaction_id} - ${new Date(trx.tanggal_transaksi).toLocaleDateString('id-ID')}`);
      trx.transaction_items.forEach(item => {
        const subtotal = item.subtotal;
        total += subtotal;
        doc.text(`  - ${item.menu.nama_makanan} x${item.jumlah} = Rp ${subtotal.toLocaleString('id-ID')}`);
      });
      doc.moveDown();
    });

    doc.fontSize(14).text(`Total Pendapatan: Rp ${total.toLocaleString('id-ID')}`, { bold: true });

    doc.end();
  });
}

module.exports = { createLaporanPDF };