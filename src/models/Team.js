const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slotNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  players: [{
    userId: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['captain', 'player'],
      default: 'player'
    }
  }],
  captain: {
    userId: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  draws: {
    type: Number,
    default: 0
  },
  totalMatches: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  lastMatchAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries (slotNumber and teamName already have unique constraints)
teamSchema.index({ 'captain.userId': 1 });

// Virtual for win rate
teamSchema.virtual('winRate').get(function() {
  if (this.totalMatches === 0) return 0;
  return ((this.wins / this.totalMatches) * 100).toFixed(1);
});

// Method to update match statistics
teamSchema.methods.updateStats = function(result) {
  this.totalMatches += 1;
  this.lastMatchAt = new Date();
  
  switch (result) {
    case 'win':
      this.wins += 1;
      this.points += 3;
      break;
    case 'loss':
      this.losses += 1;
      break;
    case 'draw':
      this.draws += 1;
      this.points += 1;
      break;
  }
  
  return this.save();
};

// Static method to get next available slot
teamSchema.statics.getNextSlot = async function() {
  const lastTeam = await this.findOne().sort({ slotNumber: -1 });
  return lastTeam ? lastTeam.slotNumber + 1 : 1;
};

// Static method to get leaderboard
teamSchema.statics.getLeaderboard = async function() {
  return await this.find({ isActive: true })
    .sort({ points: -1, wins: -1, losses: 1 })
    .select('teamName slotNumber wins losses draws points totalMatches');
};

module.exports = mongoose.model('Team', teamSchema); 