import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTicketById, addComment, clearCurrentTicket } from '../store/ticketSlice';
import api from '../services/api';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [newComment, setNewComment] = useState('');
  const [cannedResponses, setCannedResponses] = useState([]);
  const [showCannedDropdown, setShowCannedDropdown] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  const { currentTicket: ticket, loading } = useSelector((state) => state.tickets);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchTicketById(id));
    }
    return () => {
      dispatch(clearCurrentTicket());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchCannedResponses();
    }
  }, [user]);

  useEffect(() => {
    if (ticket && ticket.status === 'closed' && !ticket.rating && ticket.userId === user?.id) {
      setShowRatingModal(true);
    }
  }, [ticket, user]);

  // Auto-refresh ticket data every 10 seconds
  useEffect(() => {
    if (!id) return;
    
    const interval = setInterval(() => {
      dispatch(fetchTicketById(id));
      setLastRefresh(new Date());
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [id, dispatch]);

  const fetchCannedResponses = async () => {
    try {
      const response = await api.get('/canned-responses');
      setCannedResponses(response.data.responses);
    } catch (error) {
      console.error('Error fetching canned responses:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      await dispatch(addComment({ ticketId: id, content: newComment })).unwrap();
      setNewComment('');
      setShowCannedDropdown(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleInsertCanned = (content) => {
    setNewComment(content);
    setShowCannedDropdown(false);
  };

  const handleSubmitRating = async () => {
    if (selectedRating === 0) {
      alert('Please select a rating');
      return;
    }
    try {
      await api.post(`/tickets/${id}/rate`, { rating: selectedRating });
      setShowRatingModal(false);
      dispatch(fetchTicketById(id));
    } catch (error) {
      console.error('Error rating ticket:', error);
      alert('Failed to submit rating');
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

  const getTimeRemaining = (slaDeadline, status) => {
    if (status === 'closed') return 'Completed';
    
    const now = new Date();
    const deadline = new Date(slaDeadline);
    const diff = deadline - now;
    
    if (diff <= 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (!ticket) return <div className="text-center py-12">Ticket not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Rate Your Experience</h2>
            <p className="text-sm text-gray-600 mb-4">
              How satisfied are you with the resolution of this ticket?
            </p>
            
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  className="text-4xl focus:outline-none transition-colors"
                >
                  {star <= selectedRating ? '⭐' : '☆'}
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Skip
              </button>
              <button
                onClick={handleSubmitRating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/dashboard')}
        className="text-blue-600 hover:text-blue-800 mb-4"
      >
        ← Back to Dashboard
      </button>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
          <div className="flex space-x-2 flex-wrap gap-y-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority} priority
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(ticket.category)}`}>
              {ticket.category?.replace('-', ' ') || 'general'}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSLAColor(ticket.slaStatus)}`}>
              {ticket.slaStatus}
            </span>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4">{ticket.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
          <div><strong>Created by:</strong> {ticket.user.name}</div>
          <div><strong>SLA Deadline:</strong> {new Date(ticket.slaDeadline).toLocaleString()}</div>
          <div>
            <strong>Time Remaining:</strong> 
            <span className={ticket.status === 'closed' ? 'text-green-600 font-medium' : ticket.slaStatus === 'overdue' ? 'text-red-600 font-medium' : 'text-blue-600'}>
              {' '}{getTimeRemaining(ticket.slaDeadline, ticket.status)}
            </span>
          </div>
          {ticket.assignedAdmin && (
            <div className="md:col-span-2">
              <strong>Assigned to:</strong> 
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                👤 {ticket.assignedAdmin.name} ({ticket.assignedAdmin.email})
              </span>
            </div>
          )}
          {ticket.rating && (
            <div className="md:col-span-2">
              <strong>Customer Rating:</strong>
              <span className="ml-2">
                {Array.from({ length: ticket.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
                <span className="ml-2 text-sm text-gray-600">({ticket.rating}/5)</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Comments ({ticket.comments?.length || 0})
          </h2>
          <span className="text-xs text-gray-500">
            🔄 Auto-refresh: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
        
        {ticket.status === 'closed' ? (
          <div className="mb-6 bg-gray-100 border border-gray-300 rounded-md p-4 text-center">
            <p className="text-gray-600">This ticket is closed. Comments are disabled.</p>
          </div>
        ) : (
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="mt-2 flex items-center space-x-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Add Comment
              </button>
              {user?.role === 'admin' && cannedResponses.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCannedDropdown(!showCannedDropdown)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
                  >
                    📋 Templates
                  </button>
                  {showCannedDropdown && (
                    <div className="absolute left-0 mt-2 w-96 bg-white rounded-md shadow-lg z-10 max-h-96 overflow-y-auto border border-gray-200">
                      {cannedResponses.map((response) => (
                        <button
                          key={response.id}
                          type="button"
                          onClick={() => handleInsertCanned(response.content)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100"
                        >
                          <div className="font-medium text-sm text-gray-900">{response.title}</div>
                          <div className="text-xs text-gray-500 mt-1 truncate">{response.content}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        )}

        <div className="space-y-4">
          {ticket.comments?.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No comments yet. Start the conversation!</p>
          ) : (
            ticket.comments?.map((comment) => {
              const isAdmin = comment.user.role === 'admin';
              return (
                <div 
                  key={comment.id} 
                  className={`border-l-4 pl-4 py-2 ${isAdmin ? 'border-purple-400 bg-purple-50' : 'border-blue-200 bg-blue-50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{comment.user.name}</span>
                      {isAdmin && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-600 text-white">
                          ⭐ Support Team
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;