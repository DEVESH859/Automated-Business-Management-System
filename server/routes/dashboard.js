const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - 7));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayOrders,
      weekOrders,
      monthOrders,
      allOrders,
      totalProducts,
      totalCustomers
    ] = await Promise.all([
      Order.find({ createdAt: { $gte: startOfDay }, status: 'completed' }),
      Order.find({ createdAt: { $gte: startOfWeek }, status: 'completed' }),
      Order.find({ createdAt: { $gte: startOfMonth }, status: 'completed' }),
      Order.find({ status: 'completed' }),
      Product.countDocuments(),
      Customer.countDocuments()
    ]);

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const weekRevenue = weekOrders.reduce((sum, order) => sum + order.total, 0);
    const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);

    const inventoryValue = await Product.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$quantity'] } } } }
    ]);

    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    }).limit(5);

    const recentOrders = await Order.find()
      .populate('customer')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      revenue: {
        today: todayRevenue,
        week: weekRevenue,
        month: monthRevenue,
        total: totalRevenue
      },
      orders: {
        today: todayOrders.length,
        week: weekOrders.length,
        month: monthOrders.length,
        total: allOrders.length
      },
      inventory: {
        totalProducts,
        value: inventoryValue[0]?.total || 0,
        lowStockCount: lowStockProducts.length
      },
      customers: {
        total: totalCustomers
      },
      lowStockAlerts: lowStockProducts,
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/chart', async (req, res) => {
  try {
    const { period } = req.query;
    let days = 30;

    if (period === 'week') days = 7;
    else if (period === 'year') days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await Order.find({
      createdAt: { $gte: startDate },
      status: 'completed'
    });

    const chartData = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      chartData[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
    }

    orders.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (chartData[dateStr]) {
        chartData[dateStr].revenue += order.total;
        chartData[dateStr].orders += 1;
      }
    });

    const result = Object.values(chartData).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/top-products', async (req, res) => {
  try {
    const orders = await Order.find({ status: 'completed' });
    const productSales = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product?.toString() || item.name;
        if (!productSales[productId]) {
          productSales[productId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json(topProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
