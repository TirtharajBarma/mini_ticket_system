import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { getAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', getAnalytics);

export default router;
