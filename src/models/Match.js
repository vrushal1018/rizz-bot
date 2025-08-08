const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true,
    unique: true
  },
  team1: {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    teamName: {
      type: String,
      required: true
    },
    slotNumber: {
      type: Number,
      required: true
    }
  },
  team2: {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    teamName: {
      type: String,
      required: true
    },
    slotNumber: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  result: {
    winner: {
      type: String,
      enum: ['team1', 'team2', 'draw', null],
      default: null
    },
    team1Score: {
      type: Number,
      default: 0
    },
    team2Score: {
      type: Number,
      default: 0
    },
    submittedBy: {
      type: String
    },
    submittedAt: {
      type: Date
    }
  },
  channels: {
    textChannel: {
      type: String
    },
    voiceChannel: {
      type: String
    },
    team1Lobby: {
      type: String
    },
    team2Lobby: {
      type: String
    }
  },
  lobby: {
    textChannel: {
      type: String
    },
    voiceChannel: {
      type: String
    }
  },
  notes: {
    type: String
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
matchSchema.index({ status: 1 });
matchSchema.index({ scheduledAt: 1 });
matchSchema.index({ 'team1.teamId': 1 });
matchSchema.index({ 'team2.teamId': 1 });

// Virtual for match duration
matchSchema.virtual('duration').get(function() {
  if (!this.startedAt || !this.endedAt) return null;
  return Math.round((this.endedAt - this.startedAt) / 1000 / 60); // minutes
});

// Method to start match
matchSchema.methods.startMatch = function() {
  this.status = 'in_progress';
  this.startedAt = new Date();
  return this.save();
};

// Method to end match
matchSchema.methods.endMatch = function(result, submittedBy) {
  this.status = 'completed';
  this.endedAt = new Date();
  this.result = {
    ...this.result,
    ...result,
    submittedBy,
    submittedAt: new Date()
  };
  return this.save();
};

// Static method to get upcoming matches
matchSchema.statics.getUpcomingMatches = async function() {
  return await this.find({
    status: 'scheduled',
    scheduledAt: { $gte: new Date() }
  }).sort({ scheduledAt: 1 });
};

// Static method to get active matches
matchSchema.statics.getActiveMatches = async function() {
  return await this.find({
    status: 'in_progress'
  }).sort({ startedAt: 1 });
};

// Static method to get team matches
matchSchema.statics.getTeamMatches = async function(teamId, limit = 10) {
  return await this.find({
    $or: [
      { 'team1.teamId': teamId },
      { 'team2.teamId': teamId }
    ]
  }).sort({ createdAt: -1 }).limit(limit);
};

module.exports = mongoose.model('Match', matchSchema); 