import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5000;

// Admin Seeder
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@restaurant.com' });
    const customerExists = await User.findOne({ email: 'user@restaurant.com' });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        name: 'Super Admin',
        email: 'admin@restaurant.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin seeded successfully');
    }

    if (!customerExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('user123', salt);
      await User.create({
        name: 'Test Customer',
        email: 'user@restaurant.com',
        password: hashedPassword,
        role: 'customer'
      });
      console.log('Customer seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding admin', error);
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connect error:', err.message);
    console.error('Failed to connect to your database. Please check your internet connection, ensure your IP is whitelisted in MongoDB Atlas, and verify your MONGODB_URI.');
    process.exit(1);
  }

  seedAdmin();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

connectDB();
