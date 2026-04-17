import express from 'express';
import Booking from '../models/Booking.js';
import Table from '../models/Table.js';
import { protect, adminProtect } from '../middlewares/authMiddleware.js';

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

// POST check availability & create booking
router.post('/', protect, async (req, res) => {
  const { restaurantId, tableId, date, time, guests } = req.body;
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

      // Validation: Ensure table is perfectly free from overlaps
      const existingBookings = await Booking.find({ restaurantId, tableId, date, status: 'confirmed' });
      
      const toMinutes = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      
      const isAvailable = !existingBookings.some(b => {
        const bStart = toMinutes(b.time);
        const bEnd = bStart + b.duration;
        const selectStart = toMinutes(time);
        const selectEnd = selectStart + duration;
        return Math.max(bStart, selectStart) < Math.min(bEnd, selectEnd);
      });

      if (!isAvailable) {
        return res.status(400).json({ message: 'Table is already booked for this time' });
      }

      returnMessage = `Booking Successful! Your requested table is reserved for you for ${duration} mins.`;
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
      status: 'confirmed'
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

// PUT change status (ADMIN ONLY) - completed, no-show
router.put('/:id/status', protect, adminProtect, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
