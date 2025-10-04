import { z } from 'zod';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Validation failed' });
    }
  };
};

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  adminCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const ticketSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['high', 'medium', 'low']),
  category: z.string().default('general'),
});

export const commentSchema = z.object({
  content: z.string().min(1),
});