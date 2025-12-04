const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Assignment = sequelize.define("Assignment", {
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
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  maxScore: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 100.00,
  },
  submissionType: {
    type: DataTypes.ENUM('text', 'file', 'url', 'both'),
    defaultValue: 'both',
  },
  allowedFileTypes: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of allowed file extensions',
  },
  maxFileSize: {
    type: DataTypes.INTEGER,
    defaultValue: 10485760, // 10MB in bytes
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  allowLateSubmission: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of reference material URLs provided by instructor',
  },
}, {
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['courseId'] },
  ],
});

module.exports = Assignment;
