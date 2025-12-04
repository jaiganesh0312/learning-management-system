const { UserRole, Role } = require('../models');

/**
 * RBAC utility functions for permission checking
 */

/**
 * Get all permissions for a user across all their roles or specific active role
 * @param {string} userId - User ID
 * @param {string} [activeRoleId] - Optional Active Role ID
 * @returns {Promise<string[]>} - Array of unique permission strings
 */
async function getUserPermissions(userId, activeRoleId = null) {
  try {
    const whereClause = { userId };
    if (activeRoleId) {
      whereClause.roleId = activeRoleId;
    }

    const userRoles = await UserRole.findAll({
      where: whereClause,
      include: [{
        model: Role,
        as: 'role',
        where: { isActive: true },
        attributes: ['permissions'],
      }],
    });

    // Flatten and deduplicate permissions from all roles
    const permissionsSet = new Set();
    userRoles.forEach(userRole => {
      if (userRole.role && Array.isArray(userRole.role.permissions)) {
        userRole.role.permissions.forEach(permission => {
          permissionsSet.add(permission);
        });
      }
    });

    return Array.from(permissionsSet);
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Get all roles for a user
 * @param {string} userId - User ID
 * @returns {Promise<Role[]>} - Array of Role objects
 */
async function getUserRoles(userId) {
  try {
    const userRoles = await UserRole.findAll({
      where: { userId },
      include: [{
        model: Role,
        as: 'role',
        where: { isActive: true },
      }],
    });

    return userRoles.map(ur => ur.role).filter(Boolean);
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
}

/**
 * Check if user has a specific permission
 * @param {string} userId - User ID
 * @param {string} permission - Permission to check
 * @param {string} [activeRoleId] - Optional Active Role ID
 * @returns {Promise<boolean>}
 */
async function checkPermission(userId, permission, activeRoleId = null) {
  const permissions = await getUserPermissions(userId, activeRoleId);
  return permissions.includes(permission);
}

/**
 * Check if user has any of the given permissions
 * @param {string} userId - User ID
 * @param {string[]} permissions - Array of permissions to check
 * @param {string} [activeRoleId] - Optional Active Role ID
 * @returns {Promise<boolean>}
 */
async function checkAnyPermission(userId, permissions, activeRoleId = null) {
  const userPermissions = await getUserPermissions(userId, activeRoleId);
  return permissions.some(permission => userPermissions.includes(permission));
}

/**
 * Check if user has all of the given permissions
 * @param {string} userId - User ID
 * @param {string[]} permissions - Array of permissions to check
 * @param {string} [activeRoleId] - Optional Active Role ID
 * @returns {Promise<boolean>}
 */
async function checkAllPermissions(userId, permissions, activeRoleId = null) {
  const userPermissions = await getUserPermissions(userId, activeRoleId);
  return permissions.every(permission => userPermissions.includes(permission));
}

/**
 * Check if user has a specific role
 * @param {string} userId - User ID
 * @param {string} roleName - Role name to check
 * @returns {Promise<boolean>}
 */
async function checkRole(userId, roleName) {
  const roles = await getUserRoles(userId);
  return roles.some(role => role.name === roleName);
}

/**
 * Check if user has any of the given roles
 * @param {string} userId - User ID
 * @param {string[]} roleNames - Array of role names to check
 * @returns {Promise<boolean>}
 */
async function checkAnyRole(userId, roleNames) {
  const roles = await getUserRoles(userId);
  const userRoleNames = roles.map(role => role.name);
  return roleNames.some(roleName => userRoleNames.includes(roleName));
}

/**
 * Check if user has all of the given roles
 * @param {string} userId - User ID
 * @param {string[]} roleNames - Array of role names to check
 * @returns {Promise<boolean>}
 */
async function checkAllRoles(userId, roleNames) {
  const roles = await getUserRoles(userId);
  const userRoleNames = roles.map(role => role.name);
  return roleNames.every(roleName => userRoleNames.includes(roleName));
}

module.exports = {
  getUserPermissions,
  getUserRoles,
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  checkRole,
  checkAnyRole,
  checkAllRoles,
};
