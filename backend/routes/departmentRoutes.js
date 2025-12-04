const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/rbacMiddleware');
const PERMISSIONS = require('../constants/permissions');
const departmentController = require('../controllers/departmentController');

router.use(authMiddleware);

// View departments (accessible to authorized users)
router.get(
  '/',
  requirePermission(PERMISSIONS.MANAGE_USERS), // Or specific view permission
  departmentController.getAllDepartments
);

router.get(
  '/:id',
  requirePermission(PERMISSIONS.MANAGE_USERS),
  departmentController.getDepartment
);

// Manage departments (Admin only)
router.post(
  '/',
  requirePermission(PERMISSIONS.MANAGE_SYSTEM_SETTINGS),
  departmentController.createDepartment
);

router.put(
  '/:id',
  requirePermission(PERMISSIONS.MANAGE_SYSTEM_SETTINGS),
  departmentController.updateDepartment
);

router.delete(
  '/:id',
  requirePermission(PERMISSIONS.MANAGE_SYSTEM_SETTINGS),
  departmentController.deleteDepartment
);

// Manage Team Members
router.post(
  '/:id/members',
  requirePermission(PERMISSIONS.MANAGE_USERS),
  departmentController.assignUserToDepartment
);

router.delete(
  '/:id/members/:userId',
  requirePermission(PERMISSIONS.MANAGE_USERS),
  departmentController.removeUserFromDepartment
);

module.exports = router;
