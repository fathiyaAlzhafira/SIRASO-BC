const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSampleData() {
  try {
    // Cek apakah sudah ada warung
    const existingWarung = await prisma.toko.findFirst();
    
    if (!existingWarung) {
      console.log('Membuat data warung sample...');
      
      // Buat warung sample
      const warung1 = await prisma.toko.create({
        data: {
          nama_toko: 'Warung Makan Padang',
          alamat: 'Business Center UNAND Lt. 1'
        }
      });

      const warung2 = await prisma.toko.create({
        data: {
          nama_toko: 'Kedai Minuman',
          alamat: 'Business Center UNAND Lt. 2'
        }
      });

      const warung3 = await prisma.toko.create({
        data: {
          nama_toko: 'Warung Bakso',
          alamat: 'Business Center UNAND Lt. 1'
        }
      });

      // Buat menu sample
      const menu1 = await prisma.menu.create({
        data: {
          nama_makanan: 'Nasi Goreng',
          deskripsi: 'Nasi goreng dengan telur dan ayam',
          kategori: 'Nasi',
          jenis: 'Kering',
          harga: 15000,
          stok: 50,
          gambar_url: '/images/nasgor.jpeg',
          available: true,
          toko_id: warung1.toko_id,
          bahan: 'Nasi, telur, ayam, bumbu'
        }
      });

      const menu2 = await prisma.menu.create({
        data: {
          nama_makanan: 'Es Teh Manis',
          deskripsi: 'Teh manis dingin segar',
          kategori: 'Minuman',
          jenis: 'Manis',
          harga: 5000,
          stok: 100,
          gambar_url: '/images/bc.jpg',
          available: true,
          toko_id: warung2.toko_id,
          bahan: 'Teh, gula, es'
        }
      });

      const menu3 = await prisma.menu.create({
        data: {
          nama_makanan: 'Bakso Sapi',
          deskripsi: 'Bakso sapi dengan kuah kaldu',
          kategori: 'Sup',
          jenis: 'Berkuah',
          harga: 20000,
          stok: 30,
          gambar_url: '/images/bakso.jpeg',
          available: true,
          toko_id: warung3.toko_id,
          bahan: 'Daging sapi, tepung, bumbu'
        }
      });

      console.log('✅ Berhasil membuat data warung dan menu sample!');
    } else {
      console.log('Data warung sudah ada, melanjutkan dengan review...');
    }

    // Ambil beberapa menu yang ada
    const menus = await prisma.menu.findMany({
      take: 5
    });

    if (menus.length === 0) {
      console.log('Tidak ada menu yang ditemukan');
      return;
    }

    // Ambil beberapa user yang ada
    const users = await prisma.user.findMany({
      take: 3
    });

    if (users.length === 0) {
      console.log('Tidak ada user yang ditemukan');
      return;
    }

    // Data review sample
    const sampleReviews = [
      { rating: 5, komentar: 'Makanan sangat enak dan fresh!' },
      { rating: 4, komentar: 'Rasanya bagus, harga terjangkau' },
      { rating: 5, komentar: 'Sangat recommended, akan pesan lagi' },
      { rating: 4, komentar: 'Porsi cukup, rasanya enak' },
      { rating: 3, komentar: 'Lumayan, bisa ditingkatkan lagi' },
      { rating: 5, komentar: 'Terbaik! Sudah pesan berkali-kali' },
      { rating: 4, komentar: 'Enak dan higienis' },
      { rating: 5, komentar: 'Sangat puas dengan pelayanannya' }
    ];

    // Tambahkan review untuk setiap menu
    for (const menu of menus) {
      for (let i = 0; i < 2; i++) { // 2 review per menu
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomReview = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
        
        await prisma.review.create({
          data: {
            menu_id: menu.menu_id,
            user_id: randomUser.user_id,
            rating: randomReview.rating,
            komentar: randomReview.komentar
            // tanggal_ulas akan otomatis diisi dengan default now()
          }
        });
      }
    }

    console.log('✅ Berhasil menambahkan sample reviews!');
    
    // Tampilkan statistik
    const totalReviews = await prisma.review.count();
    const avgRating = await prisma.review.aggregate({
      _avg: {
        rating: true
      }
    });
    
    console.log(`Total reviews: ${totalReviews}`);
    console.log(`Rata-rata rating: ${avgRating._avg.rating?.toFixed(2) || '0.00'}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleData(); 