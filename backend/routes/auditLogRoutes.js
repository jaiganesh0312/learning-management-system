const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/rbacMiddleware');
const PERMISSIONS = require('../constants/permissions');
const { getAuditLogs, exportAuditLogs } = require('../controllers/auditLogController');

// All routes require authentication
router.use(authMiddleware);

// Get audit logs (paginated, with filters)
router.get('/', requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS), getAuditLogs);

// Export audit logs (CSV or JSON)
router.get('/export', requirePermission(PERMISSIONS.EXPORT_AUDIT_LOGS), exportAuditLogs);

module.exports = router;
