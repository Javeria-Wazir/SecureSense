const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  // BEFORE:
  // VULNERABILITY: Weak Authentication (Passwords stored in plain text)
  // AFTER:
  // Password SECURED using bcrypt string. It now stores the hashed representation.
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Week 6 Task: Role-Based Access Control (RBAC)
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user', // Default to 'user', admin must be manually assigned
    allowNull: false
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = User;
