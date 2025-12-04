const { checkPermission, checkAnyPermission, checkAllPermissions, checkRole, getUserPermissions } = require('../utils/rbac');
const { AuditLog } = require('../models');

/**
 * Middleware to require specific permission
 * @param {string} permission - Required permission
 */
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      const hasPermission = await checkPermission(req.user.id, permission, req.user.activeRoleId);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          success: false, 
          message: 'Insufficient permissions',
          required: permission
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error checking permissions' 
      });
    }
  };
};

/**
 * Middleware to require any of the given permissions
 * @param {string[]} permissions - Array of permissions (user needs at least one)
 */
const requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      const hasPermission = await checkAnyPermission(req.user.id, permissions, req.user.activeRoleId);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          success: false, 
          message: 'Insufficient permissions',
          requiredAny: permissions
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error checking permissions' 
      });
    }
  };
};

/**
 * Middleware to require all of the given permissions
 * @param {string[]} permissions - Array of permissions (user needs all)
 */
const requireAllPermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      const hasPermissions = await checkAllPermissions(req.user.id, permissions, req.user.activeRoleId);
      
      if (!hasPermissions) {
        return res.status(403).json({ 
          success: false, 
          message: 'Insufficient permissions',
          requiredAll: permissions
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error checking permissions' 
      });
    }
  };
};

/**
 * Middleware to require specific role
 * @param {string} roleName - Required role name
 */
const requireRole = (roleName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      const hasRole = await checkRole(req.user.id, roleName);
      
      if (!hasRole) {
        return res.status(403).json({ 
          success: false, 
          message: 'Insufficient role',
          required: roleName
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error checking role' 
      });
    }
  };
};

/**
 * Middleware to attach user permissions to request
 * Should be used after authMiddleware
 */
const attachPermissions = async (req, res, next) => {
  try {
    if (req.user) {
      req.user.permissions = await getUserPermissions(req.user.id);
    }
    next();
  } catch (error) {
    console.error('Error attaching permissions:', error);
    next(); // Continue even if permission attachment fails
  }
};

/**
 * Middleware to log actions to audit log
 * @param {string} action - Action being performed
 * @param {string} resource - Resource type
 */
const logAudit = (action, resource) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    
    // Override send function to capture response
    res.send = function(data) {
      // Parse response if it's JSON
      let responseData;
      try {
        responseData = typeof data === 'string' ? JSON.parse(data) : data;
      } catch (e) {
        responseData = {};
      }

      // Log to audit log
      AuditLog.create({
        userId: req.user?.id || null,
        roleId: req.user?.activeRoleId || null,
        action,
        resource,
        resourceId: req.params.id || responseData.data?.id || null,
        details: {
          method: req.method,
          path: req.path,
          body: req.body,
          params: req.params,
          query: req.query,
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failure',
      }).catch(err => {
        console.error('Error creating audit log:', err);
      });

      // Call original send function
      return originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  attachPermissions,
  logAudit,
};
