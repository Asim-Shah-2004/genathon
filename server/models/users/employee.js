import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  username: {
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
  location: {
    type: String,
    required: true,
  },
  callIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Call',
  }]
}, { collection: 'Employee' });

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
