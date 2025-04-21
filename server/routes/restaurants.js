const express = require('express');
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} = require('../controllers/restaurants');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getRestaurants)
  .post(protect, authorize('admin', 'restaurant'), createRestaurant);

router
  .route('/:id')
  .get(getRestaurant)
  .put(protect, authorize('admin', 'restaurant'), updateRestaurant)
  .delete(protect, authorize('admin', 'restaurant'), deleteRestaurant);

module.exports = router;