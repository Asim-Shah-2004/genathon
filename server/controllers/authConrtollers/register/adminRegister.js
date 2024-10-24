import bcrypt from 'bcrypt';
import {Admin,Employee} from "../../../models/index.js"

const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingEmployee = await Employee.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin || existingEmployee) {
      return res.status(400).json({ message: 'email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering admin', error });
  }
};

export default registerAdmin;
