import express from 'express';
import Restaurant from '../models/Restaurant.js';
import Table from '../models/Table.js';
import { protect, adminProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single restaurant
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new restaurant (ADMIN)
router.post('/', protect, adminProtect, async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    
    // Auto-generate some starter tables for easier testing/setup
    const defaultTables = [
      { restaurantId: restaurant._id, tableNumber: 'T1', capacity: 2 },
      { restaurantId: restaurant._id, tableNumber: 'T2', capacity: 4 },
      { restaurantId: restaurant._id, tableNumber: 'T3', capacity: 4 },
      { restaurantId: restaurant._id, tableNumber: 'T4', capacity: 6 },
      { restaurantId: restaurant._id, tableNumber: 'T5', capacity: 8 }
    ];
    await Table.insertMany(defaultTables);
    
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update restaurant (ADMIN)
router.put('/:id', protect, adminProtect, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE restaurant (ADMIN)
router.delete('/:id', protect, adminProtect, async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Restaurant removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
