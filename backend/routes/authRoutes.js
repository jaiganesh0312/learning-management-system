const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/set-password', authMiddleware, authController.setPassword);
router.post('/update-password', authMiddleware, authController.updatePassword);

module.exports = router;
