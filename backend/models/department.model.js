const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Department = sequelize.define("Department", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  managerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
    comment: 'Primary manager/head of department',
  },
  parentDepartmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Departments',
      key: 'id',
    },
    comment: 'Supports hierarchical department structure',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

module.exports = Department;
