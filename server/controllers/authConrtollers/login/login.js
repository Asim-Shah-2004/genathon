import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import "dotenv/config"

import {Employee,Admin} from "../../../models/index.js"

const JWT_SECRET = process.env.JWT_SECRET

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await Employee.findOne({ email });

    let role = 'employee';
    if (!user) {
      user = await Admin.findOne({ email });
      role = 'admin';
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role ,email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error });
  }
};

export default login;
