import express from 'express';
import { getAllUsers, updateUserRole, deleteUser } from '../controllers/userController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate, requireAdmin);

router.get('/', getAllUsers);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
