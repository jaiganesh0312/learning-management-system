const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserRole = sequelize.define("UserRole", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Roles',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  assignedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
    comment: 'User who assigned this role',
  },
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['roleId'] },
    { fields: ['userId', 'roleId'], unique: true }, // Prevent duplicate role assignments
  ],
});

module.exports = UserRole;
