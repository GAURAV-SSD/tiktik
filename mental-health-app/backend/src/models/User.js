const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    required: true,
    default: 'patient'
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role !== 'doctor'; // Auto-approve patients and admins
    }
  },
  
  // Profile Information
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: 500,
      default: ''
    },
    specialization: {
      type: String,
      required: function() { return this.role === 'doctor'; }
    },
    experience: {
      type: Number,
      min: 0,
      max: 50,
      required: function() { return this.role === 'doctor'; }
    },
    languages: [{
      type: String,
      trim: true
    }],
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  
  // Doctor-specific fields
  doctorInfo: {
    medicalLicense: {
      type: String,
      required: function() { return this.role === 'doctor'; },
      unique: true,
      sparse: true
    },
    certificate: {
      url: String,
      publicId: String,
      uploadedAt: Date
    },
    consultationFee: {
      type: Number,
      min: 0,
      default: 0
    },
    availableHours: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
      },
      endTime: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
      }
    }],
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Patient-specific fields
  patientInfo: {
    anonymousId: {
      type: String,
      unique: true,
      sparse: true,
      default: function() {
        return this.role === 'patient' ? `patient_${uuidv4().slice(0, 8)}` : undefined;
      }
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    },
    preferences: {
      reminderTime: {
        type: String,
        default: '09:00',
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
      },
      categories: [{
        type: String,
        enum: ['depression', 'anxiety', 'motivation', 'lifestyle', 'general']
      }]
    }
  },
  
  // Gamification
  gamification: {
    points: {
      type: Number,
      default: 0,
      min: 0
    },
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    badges: [{
      name: String,
      description: String,
      earnedAt: {
        type: Date,
        default: Date.now
      },
      icon: String
    }],
    streaks: {
      mood: {
        type: Number,
        default: 0,
        min: 0
      },
      habits: {
        type: Number,
        default: 0,
        min: 0
      },
      forum: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  },
  
  // Settings
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    accessibility: {
      highContrast: {
        type: Boolean,
        default: false
      },
      largeFonts: {
        type: Boolean,
        default: false
      },
      reducedMotion: {
        type: Boolean,
        default: false
      }
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      habitReminders: {
        type: Boolean,
        default: true
      },
      moodReminders: {
        type: Boolean,
        default: true
      },
      chatMessages: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      showOnlineStatus: {
        type: Boolean,
        default: true
      },
      allowDirectMessages: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Security fields
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '7d'
    }
  }],
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Metadata
  lastActive: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'patientInfo.anonymousId': 1 });
userSchema.index({ isApproved: 1, role: 1 });
userSchema.index({ 'doctorInfo.medicalLicense': 1 });
userSchema.index({ lastActive: -1 });

// Virtual for public profile (removes sensitive data)
userSchema.virtual('publicProfile').get(function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  
  // For patients, hide real email and use anonymous info
  if (user.role === 'patient') {
    delete user.email;
    user.displayName = user.patientInfo.anonymousId;
  } else {
    user.displayName = user.username;
  }
  
  return user;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to generate anonymous ID for patients
userSchema.pre('save', function(next) {
  if (this.role === 'patient' && !this.patientInfo.anonymousId) {
    this.patientInfo.anonymousId = `patient_${uuidv4().slice(0, 8)}`;
  }
  
  // Set username to anonymous ID for patients if not set
  if (this.role === 'patient' && (!this.username || this.username === '')) {
    this.username = this.patientInfo.anonymousId;
  }
  
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

// Method to add points and check for level up
userSchema.methods.addPoints = function(points) {
  this.gamification.points += points;
  
  // Simple level calculation (every 100 points = 1 level)
  const newLevel = Math.floor(this.gamification.points / 100) + 1;
  if (newLevel > this.gamification.level) {
    this.gamification.level = newLevel;
    return { levelUp: true, newLevel };
  }
  
  return { levelUp: false, newLevel: this.gamification.level };
};

// Method to add badge
userSchema.methods.addBadge = function(badge) {
  const existingBadge = this.gamification.badges.find(b => b.name === badge.name);
  if (!existingBadge) {
    this.gamification.badges.push(badge);
    return true;
  }
  return false;
};

// Static method to find doctors
userSchema.statics.findDoctors = function(filters = {}) {
  const query = { role: 'doctor', isApproved: true };
  
  if (filters.specialization) {
    query['profile.specialization'] = new RegExp(filters.specialization, 'i');
  }
  
  if (filters.language) {
    query['profile.languages'] = { $in: [new RegExp(filters.language, 'i')] };
  }
  
  return this.find(query)
    .select('username profile doctorInfo.rating isOnline lastActive')
    .sort({ 'doctorInfo.rating.average': -1, lastActive: -1 });
};

// Static method to generate anonymous username
userSchema.statics.generateAnonymousUsername = function() {
  return `patient_${uuidv4().slice(0, 8)}`;
};

module.exports = mongoose.model('User', userSchema);