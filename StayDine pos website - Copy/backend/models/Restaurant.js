const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: String,
  logo: String,
  bannerImage: String,
  cuisine: [String],
  address: {
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  location: {
    latitude: Number,
    longitude: Number,
    radius: {
      type: Number,
      default: 100, // in meters
    },
  },
  contactInfo: {
    email: String,
    phone: String,
    alternatePhone: String,
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  taxInfo: {
    gst: {
      type: Number,
      default: 5,
    },
    gstin: String,
    panNumber: String,
  },
  tables: {
    type: Number,
    default: 0,
  },
  capacity: {
    type: Number,
    default: 0,
  },
  subscription: {
    type: String,
    enum: ['basic', 'professional', 'enterprise'],
    default: 'basic',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
