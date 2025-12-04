const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/rbacMiddleware');
const PERMISSIONS = require('../constants/permissions');
const complianceController = require('../controllers/complianceController');

router.use(authMiddleware);

// Get department compliance status
router.get(
  '/department-status',
  requirePermission(PERMISSIONS.MANAGE_COMPLIANCE),
  complianceController.getDepartmentComplianceStatus
);

// Send compliance reminders
router.post(
  '/reminders',
  requirePermission(PERMISSIONS.SEND_BULK_REMINDERS),
  complianceController.sendComplianceReminders
);

// Bulk assign compliance path
router.post(
  '/bulk-assign',
  requirePermission(PERMISSIONS.MANAGE_COMPLIANCE),
  complianceController.bulkAssignCompliancePath
);

// Get compliance metrics
router.get(
  '/metrics',
  requirePermission(PERMISSIONS.VIEW_COMPLIANCE_REPORTS),
  complianceController.getComplianceMetrics
);

// Escalate overdue training
router.post(
  '/escalate',
  requirePermission(PERMISSIONS.SEND_BULK_REMINDERS),
  complianceController.escalateOverdueTraining
);

module.exports = router;
