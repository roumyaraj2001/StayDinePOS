const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');
const Order = require('../models/Order');

// Create billing/invoice
router.post('/', async (req, res) => {
  try {
    const { 
      restaurantId, orderId, customerId, customerName, customerPhone, 
      cashierId, discount, discountType, paymentMethod, tableNumber 
    } = req.body;

    const order = await Order.findById(orderId).populate('items.menuItemId');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let discountAmount = 0;
    if (discount) {
      discountAmount = discountType === 'percentage' 
        ? (order.subtotal * discount) / 100 
        : discount;
    }

    const cgst = (order.subtotal - discountAmount) * 0.025; // 2.5%
    const sgst = (order.subtotal - discountAmount) * 0.025; // 2.5%
    const totalAmount = order.subtotal - discountAmount + cgst + sgst;

    const billing = new Billing({
      restaurantId,
      orderId,
      invoiceNumber,
      customerId,
      customerName,
      customerPhone,
      cashierId,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.price * item.quantity,
      })),
      subtotal: order.subtotal,
      cgst,
      sgst,
      discount: discountAmount,
      discountType,
      totalAmount,
      amountPaid: totalAmount,
      balance: 0,
      paymentMethod,
      tableNumber,
      orderType: order.orderType,
      status: 'completed',
    });

    await billing.save();

    // Update order status
    await Order.findByIdAndUpdate(orderId, { 
      status: 'completed',
      paymentStatus: 'paid',
      completedAt: new Date(),
    });

    res.status(201).json({
      message: 'Invoice created successfully',
      billing,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get billing for restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const billings = await Billing.find({ restaurantId: req.params.restaurantId })
      .sort({ createdAt: -1 });
    res.json(billings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id);
    if (!billing) return res.status(404).json({ error: 'Invoice not found' });
    res.json(billing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
