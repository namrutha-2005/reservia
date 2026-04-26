import express from 'express';
import Table from '../models/Table.js';
import { protect, adminProtect, adminOrOwnerProtect } from '../middlewares/authMiddleware.js';
import Restaurant from '../models/Restaurant.js';

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

// POST add table (ADMIN or OWNER)
router.post('/', protect, adminOrOwnerProtect, async (req, res) => {
  try {
    if (req.user.role === 'restaurant_owner') {
       const restaurant = await Restaurant.findById(req.body.restaurantId);
       if (!restaurant || restaurant.ownerId?.toString() !== req.user.id) {
           return res.status(403).json({ message: 'Not authorized to add table to this restaurant' });
       }
    }
    const table = await Table.create(req.body);
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update table (ADMIN or OWNER)
router.put('/:id', protect, adminOrOwnerProtect, async (req, res) => {
  try {
    const tableToUpdate = await Table.findById(req.params.id);
    if (!tableToUpdate) return res.status(404).json({ message: 'Table not found' });
    
    if (req.user.role === 'restaurant_owner') {
       const restaurant = await Restaurant.findById(tableToUpdate.restaurantId);
       if (!restaurant || restaurant.ownerId?.toString() !== req.user.id) {
           return res.status(403).json({ message: 'Not authorized to update this table' });
       }
    }
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE table (ADMIN or OWNER)
router.delete('/:id', protect, adminOrOwnerProtect, async (req, res) => {
  try {
    const tableToDelete = await Table.findById(req.params.id);
    if (!tableToDelete) return res.status(404).json({ message: 'Table not found' });
    
    if (req.user.role === 'restaurant_owner') {
       const restaurant = await Restaurant.findById(tableToDelete.restaurantId);
       if (!restaurant || restaurant.ownerId?.toString() !== req.user.id) {
           return res.status(403).json({ message: 'Not authorized to delete this table' });
       }
    }
    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: 'Table removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
