# TB-SIRASO (Sistem Informasi Restoran dan Cafe)

Aplikasi web untuk sistem informasi restoran dan cafe yang memungkinkan pengguna untuk memesan makanan secara online.

## 🚀 Fitur

- ✅ Sistem autentikasi (login/register)
- ✅ Manajemen menu restoran
- ✅ Keranjang belanja
- ✅ Sistem pemesanan
- ✅ Manajemen transaksi
- ✅ Laporan penjualan
- ✅ Sistem review dan rating
- ✅ Manajemen diskon
- ✅ Generate PDF untuk bukti transaksi

## 📋 Prerequisites

Sebelum menjalankan aplikasi, pastikan Anda telah menginstall:

- [Node.js](https://nodejs.org/) (versi 14 atau lebih baru)
- [MySQL](https://www.mysql.com/) (versi 8.0 atau lebih baru)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)

## 🛠️ Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/IhsanurraisPardika/TB-SIRASO.git
   cd TB-SIRASO
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   npm run setup
   ```

4. **Konfigurasi database**
   - Buat database MySQL dengan nama `tb_siraso`
   - Edit file `.env` dan sesuaikan `DATABASE_URL` dengan kredensial MySQL Anda:
     ```
     DATABASE_URL="mysql://username:password@localhost:3306/tb_siraso"
     ```

5. **Generate Prisma client dan push schema**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Jalankan aplikasi**
   ```bash
   npm start
   ```

   Atau untuk development mode:
   ```bash
   npm run dev
   ```

7. **Akses aplikasi**
   Buka browser dan kunjungi: `http://localhost:3000`

## 📁 Struktur Project

```
TB-SIRASO/
├── app.js                 # Entry point aplikasi
├── package.json           # Dependencies dan scripts
├── prisma/
│   └── schema.prisma      # Database schema
├── routes/                # Route handlers
├── controller/            # Business logic
├── views/                 # EJS templates
├── public/                # Static files
└── middleware/            # Custom middleware
```

## 🗄️ Database Schema

Aplikasi menggunakan Prisma ORM dengan model-model berikut:

- **User**: Data pengguna
- **Toko**: Data restoran/cafe
- **Menu**: Menu makanan
- **Keranjang**: Keranjang belanja
- **Transactions**: Transaksi
- **PickupSchedule**: Jadwal pengambilan
- **Review**: Review dan rating
- **Discounts**: Kode diskon
- **SalesReports**: Laporan penjualan

## 🔧 Scripts

- `npm start`: Menjalankan aplikasi dalam mode production
- `npm run dev`: Menjalankan aplikasi dalam mode development dengan nodemon
- `npm run setup`: Setup awal aplikasi (membuat .env file)

## 🐛 Troubleshooting

### Error: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Error: "Database connection failed"
- Pastikan MySQL server berjalan
- Periksa kredensial database di file `.env`
- Pastikan database `tb_siraso` sudah dibuat

### Error: "Port 3000 is already in use"
- Ganti port di file `.env` atau
- Matikan aplikasi yang menggunakan port 3000

## 📝 License

ISC License

## 👥 Contributors

- IhsanurraisPardika

## 📞 Support

Jika mengalami masalah, silakan buat issue di repository GitHub ini. 