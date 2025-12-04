const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isEmail: true },
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // isPhoneVerified: {
  //   type: DataTypes.BOOLEAN,
  //   defaultValue: false,
  otpHash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otpExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // FIXED — UUID
  departmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "Departments",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },
  
  // Active role for multi-role users (role switching feature)
  activeRoleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "Roles",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
    comment: "Currently active role for users with multiple roles",
  },
}, {
  timestamps: true,
});

module.exports = User;
