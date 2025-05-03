const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Message = require('./Message');

const ReadReceipt = sequelize.define('ReadReceipt', {
  readAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

ReadReceipt.belongsTo(User);
ReadReceipt.belongsTo(Message);

module.exports = ReadReceipt;



