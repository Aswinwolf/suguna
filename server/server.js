import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import subCategoryRoutes from './routes/subCategoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Service booking module
import addressRoutes from './routes/addressRoutes.js';
import serviceCategoryRoutes from './routes/serviceCategoryRoutes.js';
import repairServiceRoutes from './routes/repairServiceRoutes.js';
import sparePartRoutes from './routes/sparePartRoutes.js';
import serviceBookingRoutes from './routes/serviceBookingRoutes.js';
import technicianRoutes from './routes/technicianRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import serviceStatsRoutes from './routes/serviceStatsRoutes.js';

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  '*',
  '*',
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const cleaned = url.trim().replace(/\/+$/, '');
    if (cleaned && !allowedOrigins.includes(cleaned)) {
      allowedOrigins.push(cleaned);
    }
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');
    try {
      const hostname = new URL(origin).hostname;
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        hostname.endsWith('.vercel.app') ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1'
      ) {
        return callback(null, true);
      }
    } catch {
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Suguna Home Appliances API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Service booking module
app.use('/api/addresses', addressRoutes);
app.use('/api/service-categories', serviceCategoryRoutes);
app.use('/api/repair-services', repairServiceRoutes);
app.use('/api/spare-parts', sparePartRoutes);
app.use('/api/bookings', serviceBookingRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/service-stats', serviceStatsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use.`);
    console.error('   Another server instance may be running.');
    console.error('   To find and kill the process on Windows, run:');
    console.error(`     netstat -ano | findstr :${PORT}`);
    console.error('     taskkill /PID <PID> /F\n');
  } else {
    console.error('Server startup error:', error.message);
  }
  process.exit(1);
});
