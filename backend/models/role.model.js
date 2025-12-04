const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Role = sequelize.define("Role", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,

    comment: 'Internal role name (e.g., super_admin, content_creator)',
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'User-friendly display name',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description of role responsibilities',
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'Array of permission strings',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this role is currently active',
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['name'], unique: true },
  ],
});

module.exports = Role;
