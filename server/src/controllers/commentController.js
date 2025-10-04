import prisma from '../config/database.js';

export const addComment = async (req, res) => {
  try {
    const { id: ticketId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    // Check if ticket exists and user has access
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check access - users can only comment on their own tickets, admins can comment on any
    if (!isAdmin && ticket.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if ticket is closed
    if (ticket.status === 'closed') {
      return res.status(400).json({ error: 'Cannot comment on closed ticket' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        ticketId,
      },
      include: {
        user: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getComments = async (req, res) => {
  try {
    const { id: ticketId } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    // Check if ticket exists and user has access
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (!isAdmin && ticket.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const comments = await prisma.comment.findMany({
      where: { ticketId },
      include: {
        user: {
          select: { id: true, name: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};