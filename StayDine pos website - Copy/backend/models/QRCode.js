const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  qrCodeId: {
    type: String,
    unique: true,
    required: true,
  },
  tableNumber: {
    type: Number,
    required: true,
  },
  qrCode: String, // Base64 encoded QR code image
  qrCodeUrl: String, // URL to QR code
  capacity: Number,
  location: String,
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

qrCodeSchema.index({ restaurantId: 1, tableNumber: 1 });

module.exports = mongoose.model('QRCode', qrCodeSchema);
