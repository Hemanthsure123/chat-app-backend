const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Message = require('../models/Message');

router.get('/', auth, async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      include: [{ model: User, through: 'ConversationUsers', where: { id: req.user.id } }],
    });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID is required' });

  if (!req.user?.id) return res.status(401).json({ message: 'Authenticated user ID is missing' });

  const user = await User.findByPk(userId);
  if (!user) return res.status(400).json({ message: 'User not found' });

  try {
    const conversation = await Conversation.create();
    await conversation.addUsers([req.user.id, userId]);
    res.json(conversation);
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ message: err.message || 'Failed to create conversation' });
  }
});

router.get('/:id/messages', async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { conversationId: req.params.id },
      include: [{ model: require('../models/User'), as: 'sender' }],
      limit: 50,
      order: [['createdAt', 'ASC']],
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
