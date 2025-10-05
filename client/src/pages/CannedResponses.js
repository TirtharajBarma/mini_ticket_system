import { useState, useEffect } from 'react';
import api from '../services/api';

const CannedResponses = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchResponses();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchResponses();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchResponses = async () => {
    try {
      const response = await api.get('/canned-responses');
      setResponses(response.data.responses);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert('Failed to load canned responses. Please refresh the page.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/canned-responses/${editingId}`, formData);
        setEditingId(null);
      } else {
        await api.post('/canned-responses', formData);
      }
      setFormData({ title: '', content: '' });
      setShowCreateForm(false);
      fetchResponses();
    } catch (error) {
      alert('Failed to save canned response. Please try again.');
    }
  };

  const handleEdit = (response) => {
    setFormData({ title: response.title, content: response.content });
    setEditingId(response.id);
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this canned response?')) return;
    try {
      await api.delete(`/canned-responses/${id}`);
      fetchResponses();
    } catch (error) {
      alert('Failed to delete canned response. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingId(null);
    setFormData({ title: '', content: '' });
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Canned Responses</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Create New Response
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Canned Response' : 'Create New Canned Response'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Welcome Message, Account Activation Help"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  required
                  rows="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Write your response template here..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {responses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No canned responses yet. Create your first one!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {responses.map((response) => (
              <li key={response.id} className="px-4 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{response.title}</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{response.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Created {new Date(response.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(response)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(response.id)}
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

export default CannedResponses;
