const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Enrollment = sequelize.define("Enrollment", {
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
  courseId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Courses',
      key: 'id',
    },
    onDelete: 'CASCADE',
    comment: 'Direct course enrollment',
  },
  learningPathId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'LearningPaths',
      key: 'id',
    },
    onDelete: 'CASCADE',
    comment: 'Learning path enrollment',
  },
  enrolledBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
    comment: 'Manager or admin who enrolled the user',
  },
  status: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'expired', 'failed'),
    defaultValue: 'not_started',
  },
  progress: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    comment: 'Progress percentage (0-100)',
    validate: {
      min: 0,
      max: 100,
    },
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Final score percentage',
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'For recurring compliance training',
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lastReminderAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['courseId'] },
    { fields: ['learningPathId'] },
    { fields: ['status'] },
    { fields: ['dueDate'] },
  ],
});

module.exports = Enrollment;
