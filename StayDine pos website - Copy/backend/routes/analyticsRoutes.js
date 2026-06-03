const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const Order = require('../models/Order');
const Billing = require('../models/Billing');

// Get sales analytics for date range
router.get('/sales/:restaurantId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { restaurantId: req.params.restaurantId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const analytics = await Analytics.find(query).sort({ date: 1 });
    
    const totals = {
      totalOrders: 0,
      totalRevenue: 0,
      totalItemsSold: 0,
      totalCustomers: 0,
    };

    analytics.forEach(day => {
      totals.totalOrders += day.totalOrders || 0;
      totals.totalRevenue += day.totalRevenue || 0;
      totals.totalItemsSold += day.totalItemsSold || 0;
      totals.totalCustomers += day.totalCustomers || 0;
    });

    res.json({
      data: analytics,
      summary: totals,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard metrics
router.get('/dashboard/:restaurantId', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.countDocuments({
      restaurantId: req.params.restaurantId,
      createdAt: { $gte: today },
    });

    const revenue = await Billing.aggregate([
      {
        $match: {
          restaurantId: require('mongoose').Types.ObjectId(req.params.restaurantId),
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const activeOrders = await Order.countDocuments({
      restaurantId: req.params.restaurantId,
      status: { $in: ['pending', 'preparing'] },
    });

    res.json({
      ordersToday: orders,
      revenueToday: revenue[0]?.totalRevenue || 0,
      activeOrders,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top selling items
router.get('/items/top/:restaurantId', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const analytics = await Analytics.find({ restaurantId: req.params.restaurantId });

    const itemSales = {};
    analytics.forEach(day => {
      if (day.topSellingItems) {
        day.topSellingItems.forEach(item => {
          if (!itemSales[item.itemName]) {
            itemSales[item.itemName] = 0;
          }
          itemSales[item.itemName] += item.quantitySold || 0;
        });
      }
    });

    const sorted = Object.entries(itemSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, quantity]) => ({ name, quantity }));

    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
