const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const LearningPathCourse = sequelize.define("LearningPathCourse", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  learningPathId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'LearningPaths',
      key: 'id',
    },
    onDelete: 'CASCADE',
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
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Order of course in the learning path',
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this course is mandatory in the path',
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Optional due date for this specific course',
  },
  frequency: {
    type: DataTypes.ENUM('once', 'monthly', 'quarterly', 'annually'),
    defaultValue: 'once',
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['learningPathId'] },
    { fields: ['courseId'] },
    { fields: ['learningPathId', 'courseId'], unique: true },
    { fields: ['learningPathId', 'order'] },
  ],
});

module.exports = LearningPathCourse;
