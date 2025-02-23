import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return (
    <nav>
      <Link to="/">Home</Link>
      {!isAuthenticated && <Link to="/register">Register</Link>}
      {!isAuthenticated && <Link to="/login">Login</Link>}
    </nav>
  );
};

export default Navbar;