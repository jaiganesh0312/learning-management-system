const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Enquiry = sequelize.define("Enquiry", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    company: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    enquiryType: {
        type: DataTypes.ENUM('general', 'demo', 'pricing', 'support', 'partnership', 'other'),
        defaultValue: 'general',
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'pending',
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'enquiries'
});

module.exports = Enquiry;
