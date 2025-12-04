const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Question = sequelize.define("Question", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
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
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  questionType: {
    type: DataTypes.ENUM('multiple_choice', 'true_false', 'short_answer', 'essay'),
    defaultValue: 'multiple_choice',
  },
  options: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of answer options for multiple choice questions',
  },
  correctAnswer: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Correct answer(s) - can be single value or array for multiple correct answers',
  },
  points: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 1.00,
    comment: 'Points awarded for correct answer',
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Explanation shown after answering',
  },
}, {
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['quizId'] },
    { fields: ['quizId', 'order'] },
  ],
});

module.exports = Question;
