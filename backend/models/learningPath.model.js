const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const LearningPath = sequelize.define("LearningPath", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('general', 'compliance', 'onboarding', 'skill_development'),
    defaultValue: 'general',
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Departments',
      key: 'id',
    },
    comment: 'If set, this learning path is specific to a department',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total estimated duration in minutes',
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['createdBy'] },
    { fields: ['departmentId'] },
    { fields: ['type'] },
  ],
});

module.exports = LearningPath;
