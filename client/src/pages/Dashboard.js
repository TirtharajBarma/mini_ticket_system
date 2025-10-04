import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTickets, createTicket } from '../store/ticketSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general'
  });
  const { tickets, loading } = useSelector((state) => state.tickets);

  useEffect(() => {
    dispatch(fetchTickets());
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchTickets());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createTicket(newTicket)).unwrap();
      setNewTicket({ title: '', description: '', priority: 'medium', category: 'general' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'billing': return 'bg-yellow-100 text-yellow-800';
      case 'account': return 'bg-blue-100 text-blue-800';
      case 'feature-request': return 'bg-indigo-100 text-indigo-800';
      case 'bug-report': return 'bg-red-100 text-red-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSLAColor = (slaStatus) => {
    switch (slaStatus) {
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Create New Ticket
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Ticket</h2>
            <form onSubmit={handleCreateTicket}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                >
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="account">Account</option>
                  <option value="feature-request">Feature Request</option>
                  <option value="bug-report">Bug Report</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tickets found. Create your first ticket!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="block hover:bg-gray-50 px-4 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {ticket.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {ticket.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(ticket.category)}`}>
                          {ticket.category?.replace('-', ' ') || 'general'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSLAColor(ticket.slaStatus)}`}>
                          {ticket.slaStatus}
                        </span>
                        <span className="text-xs text-gray-500">
                          {ticket._count?.comments || 0} comments
                        </span>
                        {ticket.rating && (
                          <span className="text-xs">
                            {Array.from({ length: ticket.rating }).map((_, i) => (
                              <span key={i} className="text-yellow-400">⭐</span>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Created {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        SLA: {new Date(ticket.slaDeadline).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;