const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite', // Local SQLite database file
  logging: false // Disable logging for cleaner output, but in a real app this might be useful for debugging
});

module.exports = sequelize;
