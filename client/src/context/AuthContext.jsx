import { createContext, useContext, useState, useEffect } from 'react';
import { isLoggedIn } from '../utils/api';

// Creating an auth context so it's vars and funcs could be passed to every page enabling us to
// check if the user is authenticated, to change the authentication state, or check if the authentication process is still loading
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await isLoggedIn();
        setIsAuthenticated(!!user);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Exporting and naming it useAuth
export const useAuth = () => useContext(AuthContext);