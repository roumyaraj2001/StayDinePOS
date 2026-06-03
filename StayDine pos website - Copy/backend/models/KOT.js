const mongoose = require('mongoose');

const kotSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  kotNumber: {
    type: String,
    unique: true,
    required: true,
  },
  station: {
    type: String,
    enum: ['main_kitchen', 'beverages', 'counter'],
    required: true,
  },
  items: [
    {
      menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
      },
      name: String,
      quantity: Number,
      specialInstructions: String,
      status: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'],
        default: 'pending',
      },
      prepTime: Number,
      startedAt: Date,
      completedAt: Date,
    },
  ],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  tableNumber: Number,
  customerName: String,
  orderType: String,
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'],
    default: 'pending',
  },
  printCount: {
    type: Number,
    default: 1,
  },
  lastPrintedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

kotSchema.index({ restaurantId: 1, station: 1, status: 1 });

module.exports = mongoose.model('KOT', kotSchema);
