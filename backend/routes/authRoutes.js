import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Signup user (customer only)
// @route   POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Admin Rules: Admin should NOT be able to signup
    if (role === 'admin' || email === 'admin@restaurant.com') {
      return res.status(403).json({ message: 'Admin registration is not allowed' });
    }
    
    // Explicitly allow only 'customer' or 'restaurant_owner'
    const finalRole = role === 'restaurant_owner' ? 'restaurant_owner' : 'customer';

    // Checking if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth user & get token (login)
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`[Login Flow] Attempting login for email: ${email}`);
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[Login Flow] User not found for email: ${email}`);
      return res.status(401).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[Login Flow] Password match status for ${email}: ${isMatch}`);

    if (isMatch) {
      console.log(`[Login Flow] Successful login for ${email} with role: ${user.role}`);
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
      });
    } else {
      console.log(`[Login Flow] Incorrect password for email: ${email}`);
      res.status(401).json({ message: 'Incorrect password' });
    }
  } catch (error) {
    console.error(`[Login Flow Error] ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

export default router;
