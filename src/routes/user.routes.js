const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getBasicInfo,
  getProfile,
  updateProfile,
  getProgress,
  getRanking,
  updateNotifications
} = require('../controllers/user.controller');
const { updateProfileValidation } = require('../validators/user.validator');

router.get('/basic-info', getBasicInfo);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.get('/progress', protect, getProgress);
router.get('/ranking', protect, getRanking);
router.put('/notifications', protect, updateNotifications);

module.exports = router;
