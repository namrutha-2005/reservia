import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  isTableAssigned: { type: Boolean, default: false },
  date: { type: String, required: true }, // Format YYYY-MM-DD
  time: { type: String, required: true }, // Format HH:mm
  guests: { type: Number, required: true },
  duration: { type: Number, required: true }, // in minutes
  status: { type: String, enum: ['confirmed', 'cancelled', 'completed', 'no-show'], default: 'confirmed' },
  noShowProbability: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
