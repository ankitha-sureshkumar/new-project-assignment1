import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold hover:underline">OGGYY Pet Clinic Mangement</Link>
      <div>
        {user ? (
          <>
            <Link to="/book-appointment" className="text-1xl font-bold mr-4 hover:underline">Book an Appointment</Link>
            <Link to="/pets" className="text-1xl font-bold mr-4 hover:underline">Pets</Link>
            {/* <Link to="/profile" className="text-1xl font-bold mr-4 hover:underline">Profile</Link> */}
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link
              to="/register"
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
