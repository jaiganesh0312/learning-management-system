const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const QuizAttempt = sequelize.define("QuizAttempt", {
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
  quizId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Quizzes',
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
  attemptNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Which attempt this is (1, 2, 3, etc.)',
  },
  answers: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Map of questionId to user answer',
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Score as percentage',
  },
  pointsEarned: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  totalPoints: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  passed: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'submitted', 'graded'),
    defaultValue: 'in_progress',
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  gradedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  timeSpent: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time spent in seconds',
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['quizId'] },
    { fields: ['enrollmentId'] },
    { fields: ['userId', 'quizId'] },
  ],
});

module.exports = QuizAttempt;
