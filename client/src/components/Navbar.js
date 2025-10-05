import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    return isActive(path)
      ? "bg-blue-700 border-b-4 border-white px-4 py-2 rounded-t font-semibold transition-all"
      : "hover:bg-blue-700 hover:border-b-4 hover:border-blue-300 px-4 py-2 rounded-t transition-all";
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="text-2xl font-bold hover:text-blue-200 transition-colors flex items-center gap-2">
              🎫 <span>HelpDesk Mini</span>
            </Link>
            <div className="hidden md:flex space-x-1">
              <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                📊 Dashboard
              </Link>
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin" className={navLinkClass('/admin')}>
                    👤 Admin Panel
                  </Link>
                  <Link to="/admin/analytics" className={navLinkClass('/admin/analytics')}>
                    📈 Analytics
                  </Link>
                  <Link to="/admin/users" className={navLinkClass('/admin/users')}>
                    👥 Users
                  </Link>
                  <Link to="/admin/canned-responses" className={navLinkClass('/admin/canned-responses')}>
                    📝 Templates
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm bg-blue-800 px-4 py-2 rounded-full shadow-md">
              <span className="font-semibold">👋 {user?.name}</span>
              {user?.role === 'admin' && (
                <span className="ml-2 bg-yellow-500 text-blue-900 px-2 py-1 rounded-full text-xs font-bold">
                  ⭐ ADMIN
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all hover:shadow-lg"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;