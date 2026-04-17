import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableNumber: { type: String, required: true },
  capacity: { type: Number, required: true, enum: [2, 4, 6, 8, 10] },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['available', 'occupied'], default: 'available' }
}, { timestamps: true });

export default mongoose.model('Table', tableSchema);
