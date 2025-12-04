const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Quiz = sequelize.define("Quiz", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Courses',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  passingScore: {
    type: DataTypes.INTEGER,
    defaultValue: 70,
    comment: 'Minimum percentage required to pass',
  },
  timeLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time limit in minutes (null = no limit)',
  },
  maxAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    comment: 'Maximum number of attempts allowed',
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  randomizeQuestions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  showCorrectAnswers: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Show correct answers after submission',
  },
  availableFrom: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  availableUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['courseId'] },
  ],
});

module.exports = Quiz;
