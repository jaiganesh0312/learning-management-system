const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Certificate = sequelize.define("Certificate", {
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
    onDelete: 'SET NULL',
  },
  learningPathId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'LearningPaths',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  enrollmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Enrollments',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  certificateNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  certificateUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Certificate title (course or path name)',
  },
  completionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  issuedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'For compliance certificates that expire',
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Final score achieved',
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Additional certificate data',
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['courseId'] },
    { fields: ['learningPathId'] },
    { fields: ['certificateNumber'], unique: true },
  ],
});

module.exports = Certificate;
