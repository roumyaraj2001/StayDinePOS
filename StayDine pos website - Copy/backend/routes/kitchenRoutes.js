const express = require('express');
const router = express.Router();
const KOT = require('../models/KOT');
const Order = require('../models/Order');

// Create KOT from order
router.post('/', async (req, res) => {
  try {
    const { restaurantId, orderId, station } = req.body;

    const order = await Order.findById(orderId).populate('items.menuItemId');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const kotNumber = `KOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const kot = new KOT({
      restaurantId,
      orderId,
      kotNumber,
      station,
      items: order.items
        .filter(item => item.menuItemId.station === station)
        .map(item => ({
          menuItemId: item.menuItemId._id,
          name: item.menuItemId.name,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
          prepTime: item.menuItemId.prepTime,
        })),
      tableNumber: order.tableNumber,
      customerName: order.customerName,
      orderType: order.orderType,
      status: 'pending',
    });

    await kot.save();

    res.status(201).json({
      message: 'KOT created successfully',
      kot,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending KOTs for station
router.get('/station/:station', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const kots = await KOT.find({
      restaurantId,
      station: req.params.station,
      status: { $in: ['pending', 'preparing'] },
    }).sort({ createdAt: 1 });
    res.json(kots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update KOT status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const kot = await KOT.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(status === 'completed' && { completedAt: new Date() }),
        updatedAt: Date.now(),
      },
      { new: true }
    );
    res.json(kot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update item status in KOT
router.patch('/:id/item/:itemIndex/status', async (req, res) => {
  try {
    const { status } = req.body;
    const kot = await KOT.findById(req.params.id);
    if (!kot) return res.status(404).json({ error: 'KOT not found' });

    kot.items[req.params.itemIndex].status = status;
    if (status === 'preparing') {
      kot.items[req.params.itemIndex].startedAt = new Date();
    }
    if (status === 'ready') {
      kot.items[req.params.itemIndex].completedAt = new Date();
    }

    await kot.save();
    res.json(kot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reprint KOT
router.patch('/:id/reprint', async (req, res) => {
  try {
    const kot = await KOT.findByIdAndUpdate(
      req.params.id,
      { 
        printCount: { $inc: 1 },
        lastPrintedAt: new Date(),
      },
      { new: true }
    );
    res.json({ message: 'KOT reprinted', kot });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
