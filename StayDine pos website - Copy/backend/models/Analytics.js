const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  totalOrders: Number,
  totalRevenue: Number,
  totalItemsSold: Number,
  averageOrderValue: Number,
  totalCustomers: Number,
  paymentMethodBreakdown: {
    cash: Number,
    upi: Number,
    card: Number,
    wallet: Number,
  },
  topSellingItems: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
      },
      itemName: String,
      quantitySold: Number,
      revenue: Number,
    },
  ],
  topCategories: [
    {
      category: String,
      quantitySold: Number,
      revenue: Number,
    },
  ],
  peakHours: [
    {
      hour: Number,
      orderCount: Number,
    },
  ],
  discountsGiven: Number,
  cancellations: Number,
  returns: Number,
  staffPerformance: [
    {
      staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      name: String,
      ordersProcessed: Number,
      totalAmount: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

analyticsSchema.index({ restaurantId: 1, date: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
