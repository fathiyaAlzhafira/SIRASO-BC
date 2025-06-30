const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const prisma = new PrismaClient();

exports.getMenuByToko = async (req, res) => {
  const { tokoId } = req.params;
  try {
    const allTokos = await req.prisma.toko.findMany();
    const toko = await req.prisma.toko.findUnique({
      where: { toko_id: parseInt(tokoId) },
      include: { menu: { where: { available: true } } }
    });
    if (!toko) {
      return res.status(404).render('error', { error: 'Toko tidak ditemukan', tokos: allTokos });
    }
    res.render('menu', {
      title: `Menu ${toko.nama_toko}`,
      currentToko: toko,
      tokos: allTokos,
      menus: toko.menu
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { error, tokos: await req.prisma.toko.findMany() });
  }
};

exports.filterMenuByCategory = async (req, res) => {
  const { tokoId, category } = req.params;
  try {
    const menus = await req.prisma.menu.findMany({
      where: { toko_id: parseInt(tokoId), kategori: category, available: true }
    });
    res.json(menus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.getMenusApi = async (req, res) => {
  const { toko_id, category } = req.query;
  if (!toko_id) {
    return res.status(400).json({ error: 'Parameter toko_id is required' });
  }
  try {
    const whereClause = { toko_id: parseInt(toko_id), available: true };
    if (category && category !== 'all') {
      whereClause.kategori = category.toLowerCase();
    }
    const menus = await req.prisma.menu.findMany({ where: whereClause, orderBy: { nama_makanan: 'asc' } });
    res.json(menus);
  } catch (error) {
    console.error('Error fetching menus for API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get semua menu dengan filter
exports.getMenu = async (req, res) => {
  try {
    const { 
      kategori, 
      minHarga, 
      maxHarga, 
      keyword, 
      sortBy = 'nama_makanan',
      order = 'asc',
      limit = 20
    } = req.query;

    let whereClause = {
      available: true,
      stok: { gt: 0 }
    };

    // Filter kategori
    if (kategori && kategori !== '' && kategori !== 'semua') {
      whereClause.kategori = kategori;
    }

    // Filter harga
    if ((minHarga && !isNaN(parseInt(minHarga))) || (maxHarga && !isNaN(parseInt(maxHarga)))) {
      whereClause.harga = {};
      if (minHarga && !isNaN(parseInt(minHarga))) whereClause.harga.gte = parseInt(minHarga);
      if (maxHarga && !isNaN(parseInt(maxHarga))) whereClause.harga.lte = parseInt(maxHarga);
      if (Object.keys(whereClause.harga).length === 0) delete whereClause.harga;
    }

    // Filter keyword
    if (keyword) {
      whereClause.OR = [
        { nama_makanan: { contains: keyword, mode: 'insensitive' } },
        { deskripsi: { contains: keyword, mode: 'insensitive' } },
        { bahan: { contains: keyword, mode: 'insensitive' } }
      ];
    }

    // Sorting
    let orderBy = {};
    if (sortBy === 'rating') {
      orderBy.rating = order;
    } else if (sortBy === 'harga') {
      orderBy.harga = 'asc';
    } else if (sortBy === 'harga_desc') {
      orderBy.harga = 'desc';
    } else if (sortBy === 'popularitas') {
      orderBy.nama_makanan = order;
    } else {
      orderBy.nama_makanan = order;
    }

    const menu = await prisma.menu.findMany({
      where: whereClause,
      orderBy: orderBy,
      take: parseInt(limit),
      include: {
        toko: true,
        review: {
          include: {
            user: true
          }
        }
      }
    });

    // Hitung rating rata-rata untuk setiap menu
    const menuWithRating = menu.map(item => {
      const totalRating = item.review.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = item.review.length > 0 ? totalRating / item.review.length : 0;
      
      return {
        ...item,
        rating_avg: avgRating,
        review_count: item.review.length
      };
    });

    // Jika sort by rating, sort ulang
    if (sortBy === 'rating') {
      menuWithRating.sort((a, b) => {
        if (order === 'desc') {
          return b.rating_avg - a.rating_avg;
        } else {
          return a.rating_avg - b.rating_avg;
        }
      });
    }

    // Get kategori yang tersedia
    const kategoriList = await prisma.menu.findMany({
      select: { kategori: true },
      distinct: ['kategori']
    });

    res.json({
      success: true,
      data: menuWithRating,
      kategori: kategoriList.map(k => k.kategori),
      filters: {
        kategori,
        minHarga,
        maxHarga,
        keyword,
        sortBy,
        order
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data menu' });
  }
};

// Get menu berdasarkan kategori
exports.getMenuByKategori = async (req, res) => {
  try {
    const { kategori } = req.params;
    
    const menu = await prisma.menu.findMany({
      where: {
        kategori: kategori,
        available: true,
        stok: { gt: 0 }
      },
      include: {
        toko: true,
        review: {
          include: {
            user: true
          }
        }
      }
    });

    // Hitung rating rata-rata untuk setiap menu
    const menuWithRating = menu.map(item => {
      const totalRating = item.review.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = item.review.length > 0 ? totalRating / item.review.length : 0;
      
      return {
        ...item,
        rating_avg: avgRating,
        review_count: item.review.length
      };
    });

    res.json({
      success: true,
      data: menuWithRating,
      kategori: kategori
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data menu' });
  }
};

// Get menu populer
exports.getMenuPopuler = async (req, res) => {
  try {
    // Ambil menu berdasarkan jumlah pesanan terbanyak
    const menuPopuler = await prisma.menu.findMany({
      where: {
        available: true,
        stok: { gt: 0 }
      },
      include: {
        toko: true,
        transaction_items: true,
        review: {
          include: {
            user: true
          }
        }
      },
      take: 10
    });

    // Hitung jumlah pesanan dan rating
    const menuWithStats = menuPopuler.map(item => {
      const totalPesanan = item.transaction_items.reduce((sum, ti) => sum + ti.jumlah, 0);
      const totalRating = item.review.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = item.review.length > 0 ? totalRating / item.review.length : 0;
      
      return {
        ...item,
        total_pesanan: totalPesanan,
        rating_avg: avgRating,
        review_count: item.review.length
      };
    });

    // Sort berdasarkan jumlah pesanan
    menuWithStats.sort((a, b) => b.total_pesanan - a.total_pesanan);

    res.json({
      success: true,
      data: menuWithStats
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil menu populer' });
  }
};

// Get menu berdasarkan rating
exports.getMenuByRating = async (req, res) => {
  try {
    const { minRating = 4 } = req.query;
    
    const menu = await prisma.menu.findMany({
      where: {
        available: true,
        stok: { gt: 0 }
      },
      include: {
        toko: true,
        review: {
          include: {
            user: true
          }
        }
      }
    });

    // Hitung rating rata-rata untuk setiap menu
    const menuWithRating = menu.map(item => {
      const totalRating = item.review.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = item.review.length > 0 ? totalRating / item.review.length : 0;
      
      return {
        ...item,
        rating_avg: avgRating,
        review_count: item.review.length
      };
    });

    // Filter berdasarkan rating
    const filteredMenu = menuWithRating.filter(item => item.rating_avg >= parseFloat(minRating));

    // Sort berdasarkan rating
    filteredMenu.sort((a, b) => b.rating_avg - a.rating_avg);

    res.json({
      success: true,
      data: filteredMenu,
      minRating: minRating
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil menu berdasarkan rating' });
  }
};

// Get daftar warung/toko
exports.getDaftarWarung = async (req, res) => {
  try {
    const warung = await prisma.toko.findMany({
      include: {
        menu: {
          where: {
            available: true
          }
        }
      },
      orderBy: {
        nama_toko: 'asc'
      }
    });

    // Filter hanya warung yang memiliki menu
    const warungDenganMenu = warung.filter(toko => toko.menu.length > 0);

    res.json({
      success: true,
      data: warungDenganMenu
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar warung' });
  }
};

// Generate PDF daftar menu
exports.generateMenuPDF = async (req, res) => {
  try {
    const { tokoId } = req.params;
    
    const menu = await prisma.menu.findMany({
      where: {
        toko_id: parseInt(tokoId),
        available: true
      },
      include: {
        toko: true,
        review: true
      },
      orderBy: [
        { kategori: 'asc' },
        { nama_makanan: 'asc' }
      ]
    });

    if (menu.length === 0) {
      return res.status(404).json({ success: false, message: 'Tidak ada menu ditemukan' });
    }

    // Hitung rating rata-rata untuk setiap menu
    const menuWithRating = menu.map(item => {
      const totalRating = item.review.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = item.review.length > 0 ? totalRating / item.review.length : 0;
      
      return {
        ...item,
        rating_avg: avgRating,
        review_count: item.review.length
      };
    });

    // Buat PDF
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res
        .writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=daftar_menu_${menu[0].toko.nama_toko.replace(/\s+/g, '_')}.pdf`,
          'Content-Length': pdfData.length,
        })
        .end(pdfData);
    });

    // Header
    doc.fillColor('green')
      .fontSize(24)
      .text('DAFTAR MENU', { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(16)
      .text(menu[0].toko.nama_toko, { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(12)
      .text(`Alamat: ${menu[0].toko.alamat}`, { align: 'center' });

    doc.moveDown(1);

    // Group menu by kategori
    const menuByKategori = {};
    menuWithRating.forEach(item => {
      if (!menuByKategori[item.kategori]) {
        menuByKategori[item.kategori] = [];
      }
      menuByKategori[item.kategori].push(item);
    });

    // Generate menu content
    Object.keys(menuByKategori).forEach(kategori => {
      doc.fontSize(16)
        .fillColor('green')
        .text(kategori.toUpperCase(), { underline: true });

      doc.moveDown(0.5);

      menuByKategori[kategori].forEach(item => {
        doc.fontSize(12)
          .fillColor('black')
          .text(`${item.nama_makanan}`, { continued: true })
          .text(` - Rp ${item.harga.toLocaleString('id-ID')}`, { align: 'right' });

        if (item.deskripsi) {
          doc.fontSize(10)
            .fillColor('gray')
            .text(`   ${item.deskripsi}`);
        }

        doc.fontSize(10)
          .fillColor('gray')
          .text(`   Stok: ${item.stok} | Rating: ${item.rating_avg.toFixed(1)} (${item.review_count} ulasan)`);

        doc.moveDown(0.3);
      });

      doc.moveDown(0.5);
    });

    // Footer
    doc.moveDown(1);
    doc.fontSize(10)
      .fillColor('gray')
      .text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, { align: 'center' })
      .text('SIRASO BC - Universitas Andalas', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat PDF daftar menu' });
  }
};
