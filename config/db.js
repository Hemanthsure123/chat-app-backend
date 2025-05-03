const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_PATH,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite connected');
    await sequelize.sync({ alter: true }); // Sync models
  } catch (err) {
    console.error('SQLite connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };