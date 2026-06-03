const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
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
  invoiceNumber: {
    type: String,
    unique: true,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  customerName: String,
  customerPhone: String,
  cashierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  items: [
    {
      name: String,
      quantity: Number,
      unitPrice: Number,
      subtotal: Number,
    },
  ],
  subtotal: Number,
  cgst: Number,
  sgst: Number,
  igst: Number,
  discount: Number,
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
  },
  discountCode: String,
  serviceCharge: Number,
  packagingCharges: Number,
  totalAmount: Number,
  amountPaid: Number,
  balance: Number,
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'wallet', 'credit', 'split'],
  },
  paymentDetails: {
    transactionId: String,
    reference: String,
  },
  tableNumber: Number,
  orderType: String,
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending',
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

module.exports = mongoose.model('Billing', billingSchema);
