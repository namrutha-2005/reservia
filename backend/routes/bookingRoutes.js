import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Table from '../models/Table.js';
import Offer from '../models/Offer.js';
import { protect, adminProtect, adminOrOwnerProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET all bookings (ADMIN)
router.get('/', protect, adminProtect, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('userId', 'name email').populate('restaurantId', 'name location').populate('tableId', 'tableNumber');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET bookings by user
router.get('/user/:id', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.id }).populate('restaurantId', 'name location').populate('tableId', 'tableNumber');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET bookings for a specific restaurant & date (for table availability visualization)
router.get('/restaurant/:id/date/:date', async (req, res) => {
  try {
    const bookings = await Booking.find({ restaurantId: req.params.id, date: req.params.date, status: 'confirmed' });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET bookings for owner's restaurant
router.get('/owner/my-restaurant-bookings', protect, adminOrOwnerProtect, async (req, res) => {
  try {
    const restaurant = await mongoose.models.Restaurant.findOne({ ownerId: req.user.id });
    if (!restaurant) {
       return res.json([]);
    }
    const bookings = await Booking.find({ restaurantId: restaurant._id }).populate('userId', 'name email').populate('tableId', 'tableNumber').populate('restaurantId', 'name location');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST check availability & create booking
router.post('/', protect, async (req, res) => {
  const { restaurantId, tableId, date, time, guests, offerId } = req.body;
  try {
    // Dynamically calculate duration
    let duration = 90; // Default changed from 60 to 90
    if (guests >= 3 && guests <= 4) duration = 90;
    if (guests >= 5) duration = 120;

    const bookingDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const diffHours = (bookingDateTime - now) / (1000 * 60 * 60);

    let finalTableId = tableId;
    let isTableAssigned = true;
    let returnMessage = "";

    if (diffHours > 2) {
      // ADVANCE BOOKING
      isTableAssigned = false;
      finalTableId = null;
      returnMessage = "Booking Confirmed! Your table will be assigned upon arrival.";
    } else {
      // IMMEDIATE BOOKING
      if (!tableId) return res.status(400).json({ message: 'Table selection required for immediate booking' });
      
      const table = await Table.findById(tableId);
      if (table && table.status === 'occupied') {
        return res.status(400).json({ message: 'Table is currently occupied by guests who have not left yet.' });
      }

      // Validation: Ensure table is perfectly free from overlaps
      const existingBookings = await Booking.find({ restaurantId, tableId, date, status: { $in: ['confirmed', 'checked-in'] } });
      
      const toMinutes = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      
      const isAvailable = !existingBookings.some(b => {
        const bStart = toMinutes(b.time);
        const bEnd = bStart + b.duration + 15; // 15 min buffer
        const selectStart = toMinutes(time);
        const selectEnd = selectStart + duration + 15; // 15 min buffer
        return Math.max(bStart, selectStart) < Math.min(bEnd, selectEnd);
      });

      if (!isAvailable) {
        return res.status(400).json({ message: 'Table is already booked for this time' });
      }

      returnMessage = `Booking Successful! Your requested table is reserved for you for ${duration} mins.`;
    }

    // Billing Simulation
    const baseTotal = guests * 50; // fixed $50 mock per guest
    let discountAmount = 0;
    let finalTotal = baseTotal;
    let appliedOfferId = null;

    if (offerId) {
      const offer = await Offer.findById(offerId);
      if (offer && offer.isActive && guests >= offer.minGuests) {
        if (offer.discountType === 'percentage') {
          discountAmount = (baseTotal * offer.discountValue) / 100;
        } else {
          discountAmount = offer.discountValue;
        }
        finalTotal = Math.max(0, baseTotal - discountAmount);
        appliedOfferId = offer._id;
      }
    }

    const booking = await Booking.create({
      userId: req.user.id,
      restaurantId,
      tableId: finalTableId,
      isTableAssigned,
      date,
      time,
      guests,
      duration,
      status: 'confirmed',
      baseTotal,
      discountAmount,
      finalTotal,
      appliedOfferId
    });

    res.status(201).json({ booking, message: returnMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT cancel booking
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT change status (ADMIN or OWNER) - completed, no-show, checked-in
router.put('/:id/status', protect, adminOrOwnerProtect, async (req, res) => {
  try {
    const { status, tableId } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    // If it's a restaurant owner, verify this booking belongs to their restaurant
    if (req.user.role === 'restaurant_owner') {
       const restaurant = await mongoose.models.Restaurant.findById(booking.restaurantId);
       if (!restaurant || restaurant.ownerId?.toString() !== req.user.id) {
           return res.status(403).json({ message: 'Not authorized to update this booking' });
       }
    }
    
    if (status === 'checked-in') {
      const finalTableId = tableId || booking.tableId;
      if (!finalTableId) return res.status(400).json({ message: 'Table must be assigned for check-in' });
      
      await Table.findByIdAndUpdate(finalTableId, { status: 'occupied' });
      booking.tableId = finalTableId;
      booking.isTableAssigned = true;
    } else if (status === 'completed' || status === 'cancelled') {
      if (booking.tableId) {
        await Table.findByIdAndUpdate(booking.tableId, { status: 'available' });
      }
    }

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
