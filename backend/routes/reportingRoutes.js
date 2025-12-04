const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/rbacMiddleware');
const PERMISSIONS = require('../constants/permissions');
const reportingController = require('../controllers/reportingController');

router.use(authMiddleware);

// Dashboard stats (accessible to all authenticated users, data filtered by role in controller)
router.get('/dashboard', reportingController.getDashboardStats);

// Compliance Reports
router.get(
  '/compliance',
  requirePermission(PERMISSIONS.VIEW_COMPLIANCE_REPORTS),
  reportingController.getComplianceReport
);

// Audit Logs
router.get(
  '/audit-logs',
  requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS),
  reportingController.getAuditLogs
);

// Comprehensive Dashboard Routes
router.get(
  '/dashboard/super-admin',
  requirePermission(PERMISSIONS.MANAGE_SYSTEM_SETTINGS),
  reportingController.getSuperAdminDashboard
);

router.get(
  '/dashboard/content-creator',
  requirePermission(PERMISSIONS.CREATE_COURSE),
  reportingController.getContentCreatorDashboard
);

router.get(
  '/dashboard/compliance-officer',
  requirePermission(PERMISSIONS.VIEW_COMPLIANCE_REPORTS),
  reportingController.getComplianceOfficerDashboard
);

router.get(
  '/dashboard/department-manager',
  requirePermission(PERMISSIONS.VIEW_DEPARTMENT_REPORTS),
  reportingController.getDepartmentManagerDashboard
);

router.get(
  '/dashboard/auditor',
  requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS),
  reportingController.getAuditorDashboard
);

module.exports = router;
