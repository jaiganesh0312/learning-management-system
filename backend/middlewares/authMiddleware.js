const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { getUserPermissions, getUserRoles } = require('../utils/rbac');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Attach user to request
    req.user = user.toJSON();
    
    // Load user roles and permissions for RBAC
    req.user.lmsRoles = await getUserRoles(user.id);
    req.user.permissions = await getUserPermissions(user.id, user.activeRoleId);
    
    // Load active role if set
    if (user.activeRoleId) {
      const Role = require('../models/role.model');
      const activeRole = await Role.findByPk(user.activeRoleId);
      req.user.activeRole = activeRole ? activeRole.toJSON() : null;
    } else {
      req.user.activeRole = null;
    }
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const restrictTo = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};

module.exports = { authMiddleware, restrictTo };
