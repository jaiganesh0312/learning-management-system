const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const CourseMaterial = sequelize.define("CourseMaterial", {
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
  type: {
    type: DataTypes.ENUM('video', 'pdf', 'scorm', 'document', 'link', 'quiz', 'assignment'),
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Path to uploaded file or external URL',
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'File size in bytes',
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in seconds (for videos)',
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Display order within the course',
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether completing this material is required',
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Additional metadata (e.g., SCORM configuration)',
  },
}, {
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['courseId'] },
    { fields: ['courseId', 'order'] },
  ],
});

module.exports = CourseMaterial;
