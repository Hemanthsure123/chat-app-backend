const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Conversation = sequelize.define('Conversation', {
  isPrivate: { type: DataTypes.BOOLEAN, defaultValue: true },
});

Conversation.belongsToMany(User, { through: 'ConversationUsers' });
User.belongsToMany(Conversation, { through: 'ConversationUsers' });

module.exports = Conversation;



