import express from 'express';
import Table from '../models/Table.js';
import { protect, adminProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET tables for a restaurant
router.get('/:restaurantId', async (req, res) => {
  try {
    const tables = await Table.find({ restaurantId: req.params.restaurantId });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add table (ADMIN)
router.post('/', protect, adminProtect, async (req, res) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update table (ADMIN)
router.put('/:id', protect, adminProtect, async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE table (ADMIN)
router.delete('/:id', protect, adminProtect, async (req, res) => {
  try {
    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: 'Table removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
