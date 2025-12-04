const { AuditLog, User, Role } = require('../models');
const { Op } = require('sequelize');

/**
 * Get audit logs with filters and pagination
 * Only accessible to users with 'view_audit_logs' permission
 */
const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      resource,
      roleId,
      startDate,
      endDate,
      status,
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};

    if (userId) whereClause.userId = userId;
    if (action) whereClause.action = action;
    if (resource) whereClause.resource = resource;
    if (roleId) whereClause.roleId = roleId;
    if (status) whereClause.status = status;

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'displayName'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      message: 'Audit logs retrieved successfully',
      data: {
        logs,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving audit logs',
      error: error.message,
    });
  }
};

/**
 * Export audit logs to CSV or JSON
 * Only accessible to users with 'export_audit_logs' permission
 */
const exportAuditLogs = async (req, res) => {
  try {
    const {
      format = 'csv',
      userId,
      action,
      resource,
      roleId,
      startDate,
      endDate,
      status,
    } = req.query;

    // Build where clause (same as getAuditLogs)
    const whereClause = {};

    if (userId) whereClause.userId = userId;
    if (action) whereClause.action = action;
    if (resource) whereClause.resource = resource;
    if (roleId) whereClause.roleId = roleId;
    if (status) whereClause.status = status;

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    const logs = await AuditLog.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'displayName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Timestamp,User Email,User Name,Action,Resource,Resource ID,Role,Status,IP Address\n';
      const csvRows = logs.map(log => {
        const userName = log.user ? `${log.user.firstName} ${log.user.lastName}` : 'N/A';
        const userEmail = log.user?.email || 'N/A';
        const roleName = log.role?.displayName || 'N/A';
        return `${log.createdAt},"${userEmail}","${userName}","${log.action}","${log.resource}","${log.resourceId || ''}","${roleName}","${log.status}","${log.ipAddress || ''}"`;
      }).join('\n');

      const csv = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
      res.status(200).send(csv);
    } else {
      // Return JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.json`);
      res.status(200).json({
        success: true,
        data: logs,
        exportedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting audit logs',
      error: error.message,
    });
  }
};

module.exports = {
  getAuditLogs,
  exportAuditLogs,
};
