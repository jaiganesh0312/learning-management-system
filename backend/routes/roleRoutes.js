const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/rbacMiddleware');
const PERMISSIONS = require('../constants/permissions');
const roleController = require('../controllers/roleController');

// All role routes require authentication
router.use(authMiddleware);

// Get all available roles (any authenticated user can view)
router.get('/', roleController.getAllRoles);

// Get roles for a specific user
router.get('/user/:userId', roleController.getUserRoles);

// Get all users with their roles (Super Admin only)
router.get(
  '/users',
  requirePermission(PERMISSIONS.MANAGE_USERS),
  roleController.getAllUsersWithRoles
);

// Get all users with specific role (Super Admin only)
router.post(
  '/get-users-with-specific-roles',
  requirePermission(PERMISSIONS.MANAGE_USERS),
  roleController.getAllUsersWithSpecificRoles
);

// Assign role to user (Super Admin only)
router.post(
  '/assign',
  requirePermission(PERMISSIONS.MANAGE_ROLES),
  roleController.assignRole
);

// Revoke role from user (Super Admin only)
router.post(
  '/revoke',
  requirePermission(PERMISSIONS.MANAGE_ROLES),
  roleController.revokeRole
);

// Switch active role (any authenticated user with multiple roles)
router.post('/switch', roleController.switchActiveRole);

// Get my active role (any authenticated user)
router.get('/my-active-role', roleController.getMyActiveRole);

module.exports = router;
