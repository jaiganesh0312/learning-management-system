const express = require('express');
const router = express.Router();
const systemSettingsController = require('../controllers/systemSettingsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
// TODO: Add role check middleware for super admin only

// All settings routes require authentication (and super admin role in production)
router.use(authMiddleware);

router.get('/', systemSettingsController.getSettings);
router.put('/', systemSettingsController.updateSettings);

module.exports = router;
