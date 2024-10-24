import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  numberOfCalls: {
    type: Number,
    default: 0,
  },
  numberOfIncoming: {
    type: Number,
    default: 0,
  },
  numberOfOutgoing: {
    type: Number,
    default: 0,
  },
  numberOfMisbehaves: {
    type: Number,
    default: 0,
  },
  totalCalls: {
    type: Number,
    default: 0, // Total number of calls made and received (incoming + outgoing)
  },
  totalCallLength: {
    type: Number,
    default: 0, // Store total call length in seconds
  },
  averageCallLength: {
    type: Number, // Average call length in seconds
    default: 0,
  },
  averageSatisfactionScore: {
    type: Number, // Average satisfaction score out of 100
    default: 0,
  },
  averageSentiment: {
    type: Number, // Average sentiment score
    default: 0,
  },
  callLengths: {
    type: [Number], // Array of call lengths in seconds
  },
  satisfactionScores: {
    type: [Number], // Array of satisfaction scores for each call
  },
  sentimentHistory: {
    type: [Number], // Array of sentiment scores
  },
  lastCallDate: {
    type: Date, // Timestamp of the last call made
  },
  longestCall: {
    callId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Call',
    },
    length: {
      type: Number, // Longest call length in seconds
    },
    timestamp: {
      type: Date, // Timestamp of the longest call
    },
    details: {
      summary: String, // Call summary or notes
      satisfactionScore: Number, 
      sentiment: {
        distilbert: String, 
        nlptown: String, 
        emotion: String, 
      },
    },
  },
  shortestCall: {
    callId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Call',
    },
    length: {
      type: Number, 
    },
    timestamp: {
      type: Date, 
    },
    details: {
      summary: String, 
      satisfactionScore: Number,
      sentiment: {
        distilbert: String, 
        nlptown: String, 
        emotion: String,
      },
    },
  },
  totalCallTime: {
    type: Number,
    default: 0,
  },
  totalInteractions: {
    type: Number, 
    default: 0,
  },
  location: {
    type: String,
    required: true,
  },
  callIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Call',
  }],
}, { collection: 'Employee' });

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
  