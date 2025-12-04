const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Submission = sequelize.define("Submission", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  assignmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Assignments',
      key: 'id',
    },
    onDelete: 'CASCADE',
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
  enrollmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Enrollments',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Text submission content',
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of file URLs submitted by learner',
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'graded', 'returned'),
    defaultValue: 'draft',
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  score: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  gradedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
    comment: 'Trainer who graded this submission',
  },
  gradedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isLate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['assignmentId'] },
    { fields: ['userId'] },
    { fields: ['enrollmentId'] },
    { fields: ['gradedBy'] },
  ],
});

module.exports = Submission;
