import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store/store';
import { initializeAuth } from './store/authSlice';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TicketDetail from './pages/TicketDetail';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import CannedResponses from './pages/CannedResponses';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" />;
  
  return children;
};

const AppRoutes = () => {
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute adminOnly>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/canned-responses" element={
          <ProtectedRoute adminOnly>
            <CannedResponses />
          </ProtectedRoute>
        } />
        <Route path="/tickets/:id" element={
          <ProtectedRoute>
            <TicketDetail />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppRoutes />
      </Router>
    </Provider>
  );
}

export default App;