import prisma from '../config/database.js';

export const getAnalytics = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get total counts
    const totalTickets = await prisma.ticket.count();
    const openTickets = await prisma.ticket.count({ where: { status: 'open' } });
    const closedTickets = await prisma.ticket.count({ where: { status: 'closed' } });
    
    // Get overdue tickets (open tickets past SLA deadline)
    const now = new Date();
    const overdueTickets = await prisma.ticket.count({
      where: {
        status: 'open',
        slaDeadline: { lt: now }
      }
    });

    // Group tickets by priority
    const ticketsByPriority = await prisma.ticket.groupBy({
      by: ['priority'],
      _count: { id: true }
    });

    // Group tickets by category
    const ticketsByCategory = await prisma.ticket.groupBy({
      by: ['category'],
      _count: { id: true }
    });

    // Get tickets by status
    const ticketsByStatus = await prisma.ticket.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    // Get most active user (most tickets created)
    const userTicketCounts = await prisma.ticket.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1
    });

    let mostActiveUser = null;
    if (userTicketCounts.length > 0) {
      const user = await prisma.user.findUnique({
        where: { id: userTicketCounts[0].userId },
        select: { name: true, email: true }
      });
      mostActiveUser = {
        ...user,
        ticketCount: userTicketCounts[0]._count.id
      };
    }

    // Get most active admin (most tickets assigned)
    const adminTicketCounts = await prisma.ticket.groupBy({
      by: ['assignedTo'],
      _count: { id: true },
      where: { assignedTo: { not: null } },
      orderBy: { _count: { id: 'desc' } },
      take: 1
    });

    let mostActiveAdmin = null;
    if (adminTicketCounts.length > 0) {
      const admin = await prisma.user.findUnique({
        where: { id: adminTicketCounts[0].assignedTo },
        select: { name: true, email: true }
      });
      mostActiveAdmin = {
        ...admin,
        ticketCount: adminTicketCounts[0]._count.id
      };
    }

    // Get total users and admins
    const totalUsers = await prisma.user.count();
    const totalAdmins = await prisma.user.count({ where: { role: 'admin' } });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTickets = await prisma.ticket.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });

    res.json({
      analytics: {
        overview: {
          totalTickets,
          openTickets,
          closedTickets,
          overdueTickets,
          totalUsers,
          totalAdmins,
          recentTickets
        },
        ticketsByPriority: ticketsByPriority.map(item => ({
          priority: item.priority,
          count: item._count.id
        })),
        ticketsByCategory: ticketsByCategory.map(item => ({
          category: item.category,
          count: item._count.id
        })),
        ticketsByStatus: ticketsByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        })),
        topStats: {
          mostActiveUser,
          mostActiveAdmin
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
