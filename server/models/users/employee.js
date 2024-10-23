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
  }
},{collection:"Employee"});


const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
