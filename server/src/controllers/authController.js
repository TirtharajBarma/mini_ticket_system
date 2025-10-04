import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateToken } from '../config/auth.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Check if admin code is provided and valid
    let userRole = 'user';
    if (adminCode) {
      const validAdminCode = process.env.ADMIN_SECRET_CODE;
      if (adminCode === validAdminCode) {
        userRole = 'admin';
      } else {
        return res.status(400).json({ error: 'Invalid admin code' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: userRole },
      select: { id: true, name: true, email: true, role: true }
    });

    const token = generateToken(user.id, user.role);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'No account found with this email. Please sign up first.',
        code: 'USER_NOT_FOUND'
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Incorrect password. Please try again.',
        code: 'INVALID_PASSWORD'
      });
    }

    const token = generateToken(user.id, user.role);
    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};