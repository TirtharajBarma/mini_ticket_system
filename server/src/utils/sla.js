// SLA calculation utilities
export const calculateSLADeadline = (priority) => {
  const now = new Date();
  const hours = {
    high: 24,
    medium: 48,
    low: 72
  };
  
  const deadline = new Date(now.getTime() + (hours[priority] * 60 * 60 * 1000));
  return deadline;
};

export const isTicketOverdue = (slaDeadline) => {
  return new Date() > new Date(slaDeadline);
};

export const getSLAStatus = (ticket) => {
  if (ticket.status === 'closed') return 'closed';
  return isTicketOverdue(ticket.slaDeadline) ? 'overdue' : 'open';
};