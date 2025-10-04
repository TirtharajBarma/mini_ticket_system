import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);

export default router;