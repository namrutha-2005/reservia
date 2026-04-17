import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  location: { type: String, required: true, default: 'Delhi' },
  description: { type: String },
  image: { type: String }, // image URL
  openingTime: { type: String, default: '10:00' },
  closingTime: { type: String, default: '22:00' }
}, { timestamps: true });

export default mongoose.model('Restaurant', restaurantSchema);
