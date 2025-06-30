const { PrismaClient } = require('@prisma/client');

exports.getKeranjangByUser = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const userId = req.session.user.user_id;
  try {
    const keranjang = await req.prisma.keranjang.findMany({
      where: { user_id: userId },
      include: { menu: true }
    });
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    res.render('keranjang', { title: 'Keranjang Belanja', items: keranjang, formatPrice });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { error });
  }
};

exports.addToKeranjang = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Silakan login terlebih dahulu' });
  }
  const userId = req.session.user.user_id;
  const { menu_id, jumlah } = req.body;
  try {
    const menu = await req.prisma.menu.findUnique({ where: { menu_id: parseInt(menu_id) } });
    if (!menu || menu.stok < jumlah) {
      return res.status(400).json({ success: false, message: 'Stok tidak mencukupi' });
    }
    const existingItem = await req.prisma.keranjang.findFirst({
      where: { user_id: userId, menu_id: parseInt(menu_id) }
    });
    if (existingItem) {
      await req.prisma.keranjang.update({
        where: { keranjang_id: existingItem.keranjang_id },
        data: { jumlah: existingItem.jumlah + parseInt(jumlah) }
      });
    } else {
      await req.prisma.keranjang.create({
        data: { user_id: userId, menu_id: parseInt(menu_id), jumlah: parseInt(jumlah), waktu_pengambilan: new Date() }
      });
    }
    res.json({ success: true, message: 'Menu berhasil ditambahkan ke keranjang!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.updateKeranjangItem = async (req, res) => {
  const { keranjang_id } = req.params;
  const { jumlah } = req.body;
  try {
    if (parseInt(jumlah) <= 0) {
      await req.prisma.keranjang.delete({ where: { keranjang_id: parseInt(keranjang_id) } });
    } else {
      await req.prisma.keranjang.update({ where: { keranjang_id: parseInt(keranjang_id) }, data: { jumlah: parseInt(jumlah) } });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteKeranjangItem = async (req, res) => {
  const { keranjang_id } = req.params;
  try {
    await req.prisma.keranjang.delete({ where: { keranjang_id: parseInt(keranjang_id) } });
    res.json({ success: true, message: 'Item berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menghapus item' });
  }
};

exports.clearKeranjang = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
  }
  const userId = req.session.user.user_id;
  try {
    await req.prisma.keranjang.deleteMany({ where: { user_id: userId } });
    res.json({ success: true, message: 'Keranjang berhasil dikosongkan' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengosongkan keranjang' });
  }
};