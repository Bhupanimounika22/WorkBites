const express = require('express');
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getRestaurantMenu
} = require('../controllers/menu');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getMenuItems)
  .post(protect, authorize('admin', 'restaurant'), createMenuItem);

router
  .route('/:id')
  .get(getMenuItem)
  .put(protect, authorize('admin', 'restaurant'), updateMenuItem)
  .delete(protect, authorize('admin', 'restaurant'), deleteMenuItem);

router.get('/restaurant/:restaurantId', getRestaurantMenu);

module.exports = router;