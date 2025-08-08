const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['dispute', 'technical', 'missing_player', 'general', 'other'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channelId: {
    type: String,
    required: true
  },
  assignedTo: {
    type: String
  },
  assignedAt: {
    type: Date
  },
  resolvedBy: {
    type: String
  },
  resolvedAt: {
    type: Date
  },
  resolution: {
    type: String
  },
  closedAt: {
    type: Date
  },
  closedBy: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
ticketSchema.index({ status: 1 });
ticketSchema.index({ userId: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ createdAt: -1 });

// Virtual for ticket age
ticketSchema.virtual('age').get(function() {
  return Math.round((Date.now() - this.createdAt) / 1000 / 60 / 60); // hours
});

// Method to assign ticket
ticketSchema.methods.assign = function(moderatorId) {
  this.status = 'in_progress';
  this.assignedTo = moderatorId;
  this.assignedAt = new Date();
  return this.save();
};

// Method to resolve ticket
ticketSchema.methods.resolve = function(moderatorId, resolution) {
  this.status = 'resolved';
  this.resolvedBy = moderatorId;
  this.resolvedAt = new Date();
  this.resolution = resolution;
  return this.save();
};

// Method to close ticket
ticketSchema.methods.close = function(moderatorId) {
  this.status = 'closed';
  this.closedBy = moderatorId;
  this.closedAt = new Date();
  return this.save();
};

// Static method to get open tickets
ticketSchema.statics.getOpenTickets = async function() {
  return await this.find({
    status: { $in: ['open', 'in_progress'] }
  }).sort({ priority: -1, createdAt: 1 });
};

// Static method to get user tickets
ticketSchema.statics.getUserTickets = async function(userId) {
  return await this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to get ticket statistics
ticketSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    total: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

module.exports = mongoose.model('Ticket', ticketSchema); 