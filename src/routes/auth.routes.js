const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  changeTempPassword,
  resetPassword
} = require('../controllers/auth.controller');
const {
  requestAccountDeletion,
  cancelAccountDeletion,
  getDeletionStatus
} = require('../controllers/accountDeletion.controller');
const { protect } = require('../middlewares/auth');
const { checkTempPassword, requireTempPassword } = require('../middlewares/tempPasswordCheck');
const {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
  changeTempPasswordValidation,
  accountDeletionValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require('../validators/auth.validator');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgotpassword', forgotPasswordValidation, forgotPassword);
router.post('/resetpassword', resetPasswordValidation, resetPassword);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/updatepassword', protect, checkTempPassword, updatePasswordValidation, updatePassword);
router.post('/changetemppassword', protect, requireTempPassword, changeTempPasswordValidation, changeTempPassword);

router.post('/delete-account', protect, accountDeletionValidation, requestAccountDeletion);
router.post('/cancel-deletion', protect, cancelAccountDeletion);
router.get('/deletion-status', protect, getDeletionStatus);

module.exports = router;
