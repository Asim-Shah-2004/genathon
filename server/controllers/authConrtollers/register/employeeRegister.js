import bcrypt from 'bcrypt';
import { Employee, Admin } from "../../../models/index.js";

const registerEmployee = async (req, res) => {
  try {
    const { email, password, phoneNumber, location } = req.body;

    const existingEmployee = await Employee.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin || existingEmployee) {
      return res.status(400).json({ message: 'email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = new Employee({
      email,
      password: hashedPassword,
      phoneNumber,
      location,
    });

    await newEmployee.save();
    res.status(201).json({ message: 'Employee registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering employee', error });
  }
};

export default registerEmployee;
