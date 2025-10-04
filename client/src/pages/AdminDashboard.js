import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTickets, updateTicket, deleteTicket } from '../store/ticketSlice';
import api from '../services/api';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('all');
  const [adminUsers, setAdminUsers] = useState([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const { tickets, loading } = useSelector((state) => state.tickets);

  useEffect(() => {
    const filters = filter !== 'all' ? { status: filter } : {};
    dispatch(fetchTickets(filters));
    fetchAdminUsers();
  }, [dispatch, filter]);

  const fetchAdminUsers = async () => {
    try {
      const response = await api.get('/users');
      const admins = response.data.users.filter(user => user.role === 'admin');
      setAdminUsers(admins);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, status) => {
    try {
      await dispatch(updateTicket({ ticketId, updateData: { status } })).unwrap();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleAssignTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setSelectedAdminId('');
    setShowAssignDialog(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedAdminId) {
      alert('Please select an admin user');
      return;
    }

    try {
      await dispatch(updateTicket({ 
        ticketId: selectedTicketId, 
        updateData: { assignedTo: selectedAdminId } 
      })).unwrap();
      setShowAssignDialog(false);
      setSelectedTicketId(null);
      setSelectedAdminId('');
    } catch (error) {
      console.error('Error assigning ticket:', error);
      alert('Failed to assign ticket');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    try {
      await dispatch(deleteTicket(ticketId)).unwrap();
    } catch (error) {
      console.error('Error deleting ticket:', error);
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

  const getSLAColor = (slaStatus) => {
    switch (slaStatus) {
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    return status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return ticket.slaStatus === 'overdue';
    return ticket.status === filter;
  });

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Assignment Dialog */}
      {showAssignDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Assign Ticket</h2>
            <p className="text-sm text-gray-600 mb-4">Select an admin user to assign this ticket to:</p>
            
            <select
              value={selectedAdminId}
              onChange={(e) => setSelectedAdminId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
            >
              <option value="">-- Select Admin --</option>
              {adminUsers.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name} ({admin.email})
                </option>
              ))}
            </select>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAssignDialog(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssign}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="text-sm text-gray-600">Total Tickets: {tickets.length}</div>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { key: 'all', label: 'All Tickets' },
            { key: 'open', label: 'Open' },
            { key: 'closed', label: 'Closed' },
            { key: 'overdue', label: 'Overdue' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${filter === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {tab.key === 'all'
                  ? tickets.length
                  : tab.key === 'overdue'
                    ? tickets.filter(t => t.slaStatus === 'overdue').length
                    : tickets.filter(t => t.status === tab.key).length
                }
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tickets found for the selected filter.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredTickets.map((ticket) => (
              <li key={ticket.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate"
                    >
                      {ticket.title}
                    </Link>
                    <p className="text-sm text-gray-500 truncate">{ticket.description}</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSLAColor(ticket.slaStatus)}`}>
                        {ticket.slaStatus}
                      </span>
                      <span className="text-xs text-gray-500">by {ticket.user.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right text-sm text-gray-500 mr-4">
                      <p>Created {new Date(ticket.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs">SLA: {new Date(ticket.slaDeadline).toLocaleString()}</p>
                      {ticket.assignedAdmin && (
                        <p className="text-xs text-purple-600">👤 {ticket.assignedAdmin.name}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleAssignTicket(ticket.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs mr-2"
                    >
                      Assign
                    </button>

                    {ticket.status === 'open' ? (
                      <button
                        onClick={() => handleUpdateTicketStatus(ticket.id, 'closed')}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs mr-2"
                      >
                        Close
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateTicketStatus(ticket.id, 'open')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs mr-2"
                      >
                        Reopen
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;