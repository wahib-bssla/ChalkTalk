const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('./jwtMiddleware');
const Conversation = require('../models/Conversation');

const router = express.Router();

router.get('/user', verifyToken, async (req, res) => {
    
    const { username } = req.body;

    try{
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "Couldn't find user" });  //400 bad resquest

        res.json({ userId: user._id, username: user.username, socketId: user.socketId })
    }catch(err){
        res.status(500).json({ message: 'Server error', error: err.message });  //500 Internal Server Error
    }
})

router.get('/users', verifyToken, async (req, res) => {

    const { userId } = req.query
    console.log(userId)

    const chatbotId = "67b9be5876dcba6411261d09";

    try{
        const user = await User.find({ _id: { $nin: [userId, chatbotId] }}, "_id username");
        if (!user) return res.status(400).json({ message: "Couldn't find user" });

        res.json({ user })
    }catch(err){
        res.status(500).json({ message: 'Server error', error: err.message });
    }
})

router.get('/conversations', verifyToken, async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const conversations = await Conversation.find({ participants: userId })
            .sort({ lastUpdated: -1 })
            .populate({
                path: 'messages',
                populate: {
                    path: 'sender',
                    select: 'username'
                }
            })
            .populate('participants', 'username');

        if (conversations.length === 0) {
            return res.status(404).json({ message: "No conversations found" });
        }

        res.json({ conversations });
    } catch (err) {
        console.error('Error fetching conversations:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/join', verifyToken, async (req, res) => {
    const { userId, groupId } = req.body;

    try {

        const conversation = await Conversation.findById(groupId);
        if (!conversation) {
            return res.status(404).json({ message: 'Group conversation not found' });
        }

        if (conversation.type !== 'group') {
            return res.status(400).json({ message: 'Cannot join a private conversation' });
        }

        if (conversation.participants.includes(userId)) {
            return res.status(400).json({ message: 'User already joined the group' });
        }

        conversation.participants.push(userId);
        await conversation.save();

        res.json({ message: 'Successfully joined the group'});
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


router.get('/unread-messages', verifyToken, async (req, res) => {
    const { userId } = req.query;
  
    try {
      const user = await User.findById(userId);
      if (!user.lastDisconnected) return res.json({ messages: [] });
  
      const conversations = await Conversation.find({ participants: userId })
        .populate({
          path: 'messages',
          match: { timestamp: { $gt: user.lastDisconnected } },
          populate: { path: 'sender', select: 'username' }
        });
  
      const unreadMessages = conversations.flatMap(conv => 
        conv.messages.map(msg => ({
          message: msg,
          conversationId: conv._id
        }))
      );
  
      res.json({ messages: unreadMessages });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

module.exports = router;