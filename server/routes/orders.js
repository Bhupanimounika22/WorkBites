const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orders');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router
  .route('/:id')
  .get(protect, getOrder)
  .put(protect, authorize('admin', 'restaurant'), updateOrderStatus)
  .delete(protect, cancelOrder);

module.exports = router;