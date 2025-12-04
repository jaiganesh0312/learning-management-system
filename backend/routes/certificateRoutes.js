const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/rbacMiddleware');
const PERMISSIONS = require('../constants/permissions');
const certificateController = require('../controllers/certificateController');

router.use(authMiddleware);

// Learner routes
router.get('/my-certificates', certificateController.getMyCertificates);
router.get('/:certificateId', certificateController.getCertificate);

// Manager/Admin routes
router.post(
    '/generate/:enrollmentId',
    certificateController.generateCertificate
);

router.get(
    '/user/:userId',
    requirePermission(PERMISSIONS.VIEW_ALL_CERTIFICATES),
    certificateController.getUserCertificates
);

module.exports = router;
