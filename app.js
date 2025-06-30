const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const port = 3000;
const prisma = new PrismaClient();

// Middleware: Prisma di req
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'rahasia',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Routers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const orderRoutes = require('./routes/orderRoutes');
const transaksiRoutes = require('./routes/transaksiRoutes');
const menuRoutes = require('./routes/menuRoutes');
const keranjangRoutes = require('./routes/keranjangRoutes');
const apiRoutes = require('./routes/apiRoutes');
const penjualRouter = require('./routes/penjual');
const pesananPRouter = require('./routes/pesananP');
const refundRoutes = require('./routes/refundRoutes');
const historyRoutes = require('./routes/historyRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Register routes
app.use('/api', apiRoutes);
app.use('/keranjang', keranjangRoutes);
app.use('/order', orderRoutes);
app.use('/transaksi', transaksiRoutes);
app.use('/menu', menuRoutes);
app.use('/penjual', penjualRouter);
app.use('/penjual/pesanan', pesananPRouter);
app.use('/refund', refundRoutes);
app.use('/history', historyRoutes);
app.use('/pembayaran', paymentRoutes);
app.use('/users', usersRouter);
app.use('/', indexRouter); // keep this last

// 404 Not Found
app.use((req, res) => {
  res.status(404).render('error', { error: 'Halaman Tidak Ditemukan', message: '' });
});

// General error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

module.exports = app;