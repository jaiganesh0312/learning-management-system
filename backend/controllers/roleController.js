const { Role, UserRole, User, AuditLog, Department } = require('../models');
const { ROLES } = require('../constants/roles');
const { Op } = require('sequelize');

/**
 * Get all available roles
 */
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'displayName', 'description', 'permissions'],
    });

    res.status(200).json({
      success: true,
      message: 'Roles retrieved successfully',
      data: roles,
    });
  } catch (error) {
    console.error('Error getting roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving roles',
      error: error.message,
    });
  }
};

/**
 * Get roles for a specific user
 */
const getUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;

    const userRoles = await UserRole.findAll({
      where: { userId },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name', 'displayName', 'description', 'permissions'],
      }, {
        model: User,
        as: 'assignedByUser',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      }],
      order: [['assignedAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      message: 'User roles retrieved successfully',
      data: userRoles,
    });
  } catch (error) {
    console.error('Error getting user roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user roles',
      error: error.message,
    });
  }
};

/**
 * Assign role to user
 * Only Super Admin can assign roles
 */
const assignRole = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    // Validate user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Validate role exists
    const role = await Role.findByPk(roleId);
    if (!role || !role.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Role not found or inactive',
      });
    }

    // Check if user already has this role
    const existingAssignment = await UserRole.findOne({
      where: { userId, roleId },
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'User already has this role',
      });
    }

    // Create role assignment
    const userRole = await UserRole.create({
      userId,
      roleId,
      assignedBy: req.user.id,
      assignedAt: new Date(),
    });

    // eager load details
    const assignmentWithDetails = await UserRole.findByPk(userRole.id, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name', 'displayName', 'description'],
      }, {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      }],
    });

    // Create audit log
    await AuditLog.create({
      userId: req.user.id,
      roleId: req.user.activeRoleId,
      action: 'ASSIGN_ROLE',
      resource: 'UserRole',
      resourceId: userRole.id,
      details: {
        targetUserId: userId,
        roleId: roleId,
        roleName: role.name,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.status(201).json({
      success: true,
      message: `Role "${role.displayName}" assigned to user successfully`,
      data: assignmentWithDetails,
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning role',
      error: error.message,
    });
  }
};

/**
 * Revoke role from user
 * Only Super Admin can revoke roles
 */
const revokeRole = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    // Find the role assignment
    const userRole = await UserRole.findOne({
      where: { userId, roleId },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['displayName'],
      }],
    });

    if (!userRole) {
      return res.status(404).json({
        success: false,
        message: 'Role assignment not found',
      });
    }

    const roleName = userRole.role.displayName;
    
    // Delete the assignment
    await userRole.destroy();

    // Create audit log
    await AuditLog.create({
      userId: req.user.id,
      roleId: req.user.activeRoleId,
      action: 'REVOKE_ROLE',
      resource: 'UserRole',
      resourceId: userId,
      details: {
        targetUserId: userId,
        roleId: roleId,
        roleName: roleName,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.status(200).json({
      success: true,
      message: `Role "${roleName}" revoked from user successfully`,
    });
  } catch (error) {
    console.error('Error revoking role:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking role',
      error: error.message,
    });
  }
};

/**
 * Get all users with their assigned roles
 * For user management interface
 */
const getAllUsersWithSpecificRoles = async (req, res) => {
  try {
    const roles = req.body.roles;
  const roleIds = await Role.findAll({
    attributes: ['id'],
    where: { name: { [Op.in]: roles } },
    raw: true,
  });
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email'],
      include: [{
        model: UserRole,
        as: 'userRoles',
        where: { roleId: { [Op.in]: roleIds.map(role => role.id) } },
      }],
    });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
      },
    });
  } catch (error) {
    console.error('Error getting users with roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message,
    });
  }
};



const getAllUsersWithRoles = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: {
        exclude: ['password', 'otpHash', 'otpExpires'],
      },
      include: [{
        model: UserRole,
        as: 'userRoles',
        include: [{
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'displayName'],
        }],
      }, {
        model: Department,
        as: 'department',
        attributes: ['id', 'name'],
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error getting users with roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message,
    });
  }
};

/**
 * Switch user's active role
 * User can only switch to roles they have been assigned
 */
const switchActiveRole = async (req, res) => {
  try {
    const { roleId } = req.body;
    const userId = req.user.id;

    // Validate role exists
    const role = await Role.findByPk(roleId);
    if (!role || !role.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Role not found or inactive',
      });
    }

    // Verify user has this role assigned
    const userRole = await UserRole.findOne({
      where: { userId, roleId },
    });

    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'You do not have this role assigned',
      });
    }

    // Update user's active role
    const user = await User.findByPk(userId);
    const previousRoleId = user.activeRoleId;
    user.activeRoleId = roleId;
    await user.save();

    // Reload user with active role details
    await user.reload({
      include: [{
        model: Role,
        as: 'activeRole',
        attributes: ['id', 'name', 'displayName', 'description', 'permissions'],
      }, {
        model: Role,
        as: 'roles',
        attributes: ['id', 'name', 'displayName'],
        through: { attributes: [] },
      }],
    });

    // Create audit log
    await AuditLog.create({
      userId: userId,
      roleId: roleId,
      action: 'SWITCH_ROLE',
      resource: 'User',
      resourceId: userId,
      details: {
        previousRoleId,
        newRoleId: roleId,
        roleName: role.name,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.status(200).json({
      success: true,
      message: `Switched to ${role.displayName} role successfully`,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          activeRole: user.activeRole,
          roles: user.roles,
        },
      },
    });
  } catch (error) {
    console.error('Error switching role:', error);
    res.status(500).json({
      success: false,
      message: 'Error switching role',
      error: error.message,
    });
  }
};

/**
 * Get current user's active role
 */
const getMyActiveRole = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'activeRole',
        attributes: ['id', 'name', 'displayName', 'description', 'permissions'],
      }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Active role retrieved successfully',
      data: {
        activeRole: user.activeRole,
        activeRoleId: user.activeRoleId,
      },
    });
  } catch (error) {
    console.error('Error getting active role:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving active role',
      error: error.message,
    });
  }
};

module.exports = {
  getAllRoles,
  getUserRoles,
  assignRole,
  revokeRole,
  getAllUsersWithRoles,
  getAllUsersWithSpecificRoles,
  switchActiveRole,
  getMyActiveRole,
};
