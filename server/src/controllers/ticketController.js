import prisma from '../config/database.js';
import { calculateSLADeadline, getSLAStatus } from '../utils/sla.js';

export const createTicket = async (req, res) => {
  try {
    const { title, description, priority, category = 'general' } = req.body;
    const userId = req.user.userId;

    const slaDeadline = calculateSLADeadline(priority);

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority,
        category,
        slaDeadline,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: {
        ...ticket,
        slaStatus: getSLAStatus(ticket)
      }
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTickets = async (req, res) => {
  try {
    const { status, priority, category, search, sortBy, assignedTo, rating } = req.query;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    const where = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(category && { category }),
      ...(assignedTo && { assignedTo }),
      ...(rating && { rating: parseInt(rating) }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(!isAdmin && { userId }) // Non-admins only see their own tickets
    };

    // Determine sort order
    let orderBy = { createdAt: 'desc' }; // default
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    if (sortBy === 'sla') orderBy = { slaDeadline: 'asc' };

    let tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy
    });

    // Sort by priority if requested (high → medium → low)
    if (sortBy === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      tickets = tickets.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    // Get unique admin IDs and fetch them in one query
    const adminIds = [...new Set(tickets.map(t => t.assignedTo).filter(Boolean))];
    const admins = adminIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: adminIds } },
          select: { id: true, name: true, email: true }
        })
      : [];
    
    const adminMap = Object.fromEntries(admins.map(a => [a.id, a]));

    // Add admin and SLA status to tickets
    const ticketsWithDetails = tickets.map(ticket => ({
      ...ticket,
      assignedAdmin: ticket.assignedTo ? adminMap[ticket.assignedTo] : null,
      slaStatus: getSLAStatus(ticket)
    }));

    res.json({ tickets: ticketsWithDetails });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, role: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user can access this ticket
    if (!isAdmin && ticket.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get assigned admin details if ticket is assigned
    let assignedAdmin = null;
    if (ticket.assignedTo) {
      assignedAdmin = await prisma.user.findUnique({
        where: { id: ticket.assignedTo },
        select: { id: true, name: true, email: true }
      });
    }

    res.json({
      ticket: {
        ...ticket,
        assignedAdmin,
        slaStatus: getSLAStatus(ticket)
      }
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can update tickets' });
    }

    // Get old ticket data before update
    const oldTicket = await prisma.ticket.findUnique({
      where: { id },
      include: { user: true }
    });

    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(assignedTo && { assignedTo })
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({
      message: 'Ticket updated successfully',
      ticket: {
        ...ticket,
        slaStatus: getSLAStatus(ticket)
      }
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can delete tickets' });
    }

    await prisma.ticket.delete({
      where: { id }
    });

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.userId;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Get ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user owns the ticket
    if (ticket.userId !== userId) {
      return res.status(403).json({ error: 'You can only rate your own tickets' });
    }

    // Check if ticket is closed
    if (ticket.status !== 'closed') {
      return res.status(400).json({ error: 'You can only rate closed tickets' });
    }

    // Update ticket with rating
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { rating: parseInt(rating) }
    });

    res.json({
      message: 'Ticket rated successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Rate ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};