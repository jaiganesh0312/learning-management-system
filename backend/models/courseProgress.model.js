const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const CourseProgress = sequelize.define("CourseProgress", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  enrollmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Enrollments',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  courseMaterialId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'CourseMaterials',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  status: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
    defaultValue: 'not_started',
  },
  timeSpent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Time spent in seconds',
  },
  completionPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100,
    },
  },
  lastAccessedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Learner notes for this material',
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['enrollmentId'] },
    { fields: ['courseMaterialId'] },
    { fields: ['enrollmentId', 'courseMaterialId'], unique: true },
  ],
});

module.exports = CourseProgress;
