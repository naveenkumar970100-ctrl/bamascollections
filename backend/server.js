import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';

// MVC View for root status & dashboard
import { renderHomeView } from './views/homeView.js';

// MVC Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';

// Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Initialize MongoDB Connection
import { ensureAdminUser } from './controllers/authController.js';
connectDB().then(() => {
  ensureAdminUser();
});

const app = express();

// Middleware setup
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve root view (Interactive API Console & Health)
app.get('/', renderHomeView);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

import siteConfigRoutes from './routes/siteConfigRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/site-config', siteConfigRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`✨ Bamas Collections Backend Server Running ✨`);
  console.log(`🚀 Mode:     ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server:   http://localhost:${PORT}`);
  console.log(`📋 API Docs: http://localhost:${PORT}/`);
  console.log(`======================================================\n`);
});
