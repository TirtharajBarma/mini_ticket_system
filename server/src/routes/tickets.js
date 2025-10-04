import express from 'express';
import { 
  createTicket, 
  getTickets, 
  getTicketById, 
  updateTicket, 
  deleteTicket 
} from '../controllers/ticketController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateRequest, ticketSchema } from '../middleware/validation.js';

const router = express.Router();

// All ticket routes require authentication
router.use(authenticate);

router.post('/', validateRequest(ticketSchema), createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.patch('/:id', requireAdmin, updateTicket);
router.delete('/:id', requireAdmin, deleteTicket);

export default router;