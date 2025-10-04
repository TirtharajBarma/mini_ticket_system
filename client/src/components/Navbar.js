import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-xl font-bold">
              HelpDesk Mini
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">
                Dashboard
              </Link>
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin" className="hover:bg-blue-700 px-3 py-2 rounded">
                    Admin Panel
                  </Link>
                  <Link to="/admin/users" className="hover:bg-blue-700 px-3 py-2 rounded">
                    Users
                  </Link>
                  <Link to="/admin/canned-responses" className="hover:bg-blue-700 px-3 py-2 rounded">
                    Templates
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Welcome, {user?.name}
              {user?.role === 'admin' && (
                <span className="ml-2 bg-blue-800 px-2 py-1 rounded text-xs">
                  Admin
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;