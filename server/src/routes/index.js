import express from 'express';
import authRoutes from './auth.js';
import ticketRoutes from './tickets.js';
import commentRoutes from './comments.js';
import userRoutes from './users.js';
import cannedResponseRoutes from './cannedResponses.js';
import analyticsRoutes from './analytics.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/tickets', commentRoutes); // Comments are nested under tickets
router.use('/users', userRoutes);
router.use('/canned-responses', cannedResponseRoutes);
router.use('/analytics', analyticsRoutes);

export default router;