import express from 'express';
import { addComment, getComments } from '../controllers/commentController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest, commentSchema } from '../middleware/validation.js';

const router = express.Router();

// All comment routes require authentication
router.use(authenticate);

router.post('/:id/comments', validateRequest(commentSchema), addComment);
router.get('/:id/comments', getComments);

export default router;