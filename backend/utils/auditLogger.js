const { AuditLog } = require('../models');

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object (optional, for status)
 */
const createAuditLog = async (params, req) => {
  try {
    const { action, resource, resourceId, details, status = 'success' } = params;

    await AuditLog.create({
      userId: req.user?.id || null,
      roleId: req.user?.activeRoleId || null,
      action,
      resource,
      resourceId: resourceId || null,
      details: {
        method: req.method,
        path: req.path,
        body: req.body,
        params: req.params,
        query: req.query,
        ...details
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      status,
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

module.exports = { createAuditLog };
