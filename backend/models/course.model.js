const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Course category (e.g., Technical, Compliance, Soft Skills)',
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL to course thumbnail image',
  }, 
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimated duration in minutes',
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner',
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    comment: 'Content creator who created this course',
  },
  prerequisites: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of course IDs that are prerequisites',
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of tags for search and filtering',
  },
  passingScore: {
    type: DataTypes.INTEGER,
    defaultValue: 70,
    comment: 'Minimum score required to pass the course (percentage)',
  },
}, {
  timestamps: true,
  paranoid: true, // Soft delete
  indexes: [
    { fields: ['createdBy'] },
    { fields: ['status'] },
    { fields: ['category'] },
  ],
});

module.exports = Course;
