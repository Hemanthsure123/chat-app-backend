const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Room = require('./Room');
const Conversation = require('./Conversation');

const Message = sequelize.define('Message', {
  content: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('text', 'image'), defaultValue: 'text' },
  edited: { type: DataTypes.BOOLEAN, defaultValue: false },
  deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
});

Message.belongsTo(User, { as: 'sender' });
Message.belongsTo(Room, { as: 'room', allowNull: true });
Message.belongsTo(Conversation, { as: 'conversation', allowNull: true });

module.exports = Message;



