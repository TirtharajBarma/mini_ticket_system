import prisma from '../config/database.js';
import { calculateSLADeadline, getSLAStatus } from '../utils/sla.js';

export const createTicket = async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const userId = req.user.userId;

    const slaDeadline = calculateSLADeadline(priority);

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority,
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
    const { status, priority } = req.query;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    const where = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(!isAdmin && { userId }) // Non-admins only see their own tickets
    };

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch assigned admin details for each ticket
    const ticketsWithDetails = await Promise.all(
      tickets.map(async (ticket) => {
        let assignedAdmin = null;
        if (ticket.assignedTo) {
          assignedAdmin = await prisma.user.findUnique({
            where: { id: ticket.assignedTo },
            select: { id: true, name: true, email: true }
          });
        }
        return {
          ...ticket,
          assignedAdmin,
          slaStatus: getSLAStatus(ticket)
        };
      })
    );

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
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // If ticket is assigned, get assigned admin details
    let assignedAdmin = null;
    if (ticket && ticket.assignedTo) {
      assignedAdmin = await prisma.user.findUnique({
        where: { id: ticket.assignedTo },
        select: { id: true, name: true, email: true }
      });
    }

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user can access this ticket
    if (!isAdmin && ticket.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
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