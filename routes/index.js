const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Room = require('../models/Room');
const Conversation = require('../models/Conversation');

router.get('/chat-data', auth, async (req, res) => {
  try {
    const rooms = await Room.findAll();
    const conversations = await Conversation.findAll({
      include: [{ model: require('../models/User'), through: 'ConversationUsers', where: { id: req.user.id } }],
    });
    res.json({ rooms, conversations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;