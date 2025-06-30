const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupSeller() {
  try {
    console.log('🔧 Setting up seller account...\n');

    // Check if toko exists, if not create one
    let toko = await prisma.toko.findFirst({
      where: { nama_toko: 'Warung Makan Sederhana' }
    });

    if (!toko) {
      toko = await prisma.toko.create({
        data: {
          nama_toko: 'Warung Makan Sederhana',
          alamat: 'Jl. Contoh No. 123, Padang'
        }
      });
      console.log('✅ Toko created:', toko.nama_toko);
    } else {
      console.log('✅ Toko already exists:', toko.nama_toko);
    }

    // Check if seller exists, if not create one
    let seller = await prisma.seller.findFirst({
      where: { username: 'penjual1' }
    });

    if (!seller) {
      seller = await prisma.seller.create({
        data: {
          username: 'penjual1',
          password: 'password123',
          toko_id: toko.toko_id
        }
      });
      console.log('✅ Seller created:', seller.username);
    } else {
      console.log('✅ Seller already exists:', seller.username);
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Username: penjual1');
    console.log('   Password: password123');
    console.log('\n🌐 Access URL: http://localhost:3000/penjual/login');
    console.log('\n📝 After login, you will be redirected to the seller dashboard.');

  } catch (error) {
    console.error('❌ Setup error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupSeller(); 