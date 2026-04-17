import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  discountType: { type: String, enum: ['percentage', 'flat'], required: true },
  discountValue: { type: Number, required: true },
  couponCode: { type: String }, // Optional bonus requirement
  minGuests: { type: Number, default: 1 },
  validFrom: { type: String, required: true }, // Format YYYY-MM-DD
  validTill: { type: String, required: true }, // Format YYYY-MM-DD
  timeSlot: { type: String, enum: ['lunch', 'dinner', 'all'], default: 'all' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Offer', offerSchema);
