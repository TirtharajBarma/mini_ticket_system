import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getCannedResponses,
  createCannedResponse,
  updateCannedResponse,
  deleteCannedResponse
} from '../controllers/cannedResponseController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getCannedResponses);
router.post('/', createCannedResponse);
router.put('/:id', updateCannedResponse);
router.delete('/:id', deleteCannedResponse);

export default router;
