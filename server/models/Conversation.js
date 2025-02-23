const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }],
    messages: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Message' 
    }],
    type: { 
      type: String, 
      enum: ['private', 'group'], 
      required: true 
    },
    lastUpdated: { 
      type: Date, 
      default: Date.now 
    },
    // FOR GROUPS
    admin: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: function() { return this.type === 'group'; }
    },
    subject: { 
      type: String,
      required: function() { return this.type === 'group'; }
    },
    name: { 
      type: String,
      required: function() { return this.type === 'group'; }
    },
  });
  

  conversationSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
  });
  
  const Conversation = mongoose.model('Conversation', conversationSchema);

  module.exports = Conversation;