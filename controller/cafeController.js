const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getToko = async (req, res) => {
  try {
    const tokos = await req.prisma.toko.findMany();
    res.json(tokos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getTokoById = async (req, res) => {
  const { id } = req.params;
  try {
    const toko = await req.prisma.toko.findUnique({
      where: { toko_id: parseInt(id) },
      include: { menu: true }
    });
    if (!toko) {
      return res.status(404).json({ error: 'Toko not found' });
    }
    res.json(toko);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};