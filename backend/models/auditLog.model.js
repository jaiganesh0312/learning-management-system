const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const AuditLog = sequelize.define("AuditLog", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'SET NULL',
    comment: 'User who performed the action (null for system actions)',
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Action performed (e.g., CREATE_COURSE, ASSIGN_ROLE, ENROLL_USER)',
  },
  resource: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Resource type (e.g., Course, User, Enrollment)',
  },
  resourceId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID of the affected resource',
  },
  details: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Additional details about the action',
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('success', 'failure', 'error'),
    defaultValue: 'success',
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Roles',
      key: 'id',
    },
    onDelete: 'SET NULL',
    comment: 'Role that was active when this action was performed',
  },
}, {
  timestamps: true,
  updatedAt: false, // Audit logs should never be updated
  indexes: [
    { fields: ['userId'] },
    { fields: ['action'] },
    { fields: ['resource'] },
    { fields: ['resourceId'] },
    { fields: ['createdAt'] },
    { fields: ['roleId'] },
  ],
});

module.exports = AuditLog;
