import express from 'express';
import Offer from '../models/Offer.js';
import { protect, adminProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET all offers (ADMIN)
router.get('/', protect, adminProtect, async (req, res) => {
  try {
    const offers = await Offer.find().populate('restaurantId', 'name');
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active offers for a specific restaurant (PUBLIC)
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const offers = await Offer.find({ 
      restaurantId: req.params.restaurantId,
      isActive: true,
      validFrom: { $lte: today },
      validTill: { $gte: today }
    });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add offer (ADMIN)
router.post('/', protect, adminProtect, async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update offer (ADMIN)
router.put('/:id', protect, adminProtect, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE offer (ADMIN)
router.delete('/:id', protect, adminProtect, async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Offer removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
