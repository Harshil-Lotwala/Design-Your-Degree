import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';
import { useEffect, useState } from 'react';
import dalLogo from '../NavBar/DAL_LOGO_Horizontal.jpeg';

function NavBar({ user, setUser }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(user || null);

  //when user changes, check localStorage for a stored user, and  Parse and set the user if found.
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, [user]);

  //when called, clear the user sesion and state and then redirects to login page
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar">

      {/* Left section with university logo */}
      <div className='navbar-left'>
        <img src={dalLogo} alt='Dalhousie Logo' className='navbar-logo'/>
      </div>

      <div className='navbar-links'>
        <Link to="/">Home</Link>
        <Link to="/planner">Planner</Link>
        <Link to="/catalog">Catalog</Link>
        <Link to="/advisor">Advisor</Link>
        <Link to="/dashboard">Dashboard</Link>

        {/*if no user is logged in, show Login and Signup buttons */}
        {!currentUser && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}

        {/*if user is logged in, show Logout button that is connected to handlelogout*/}
        {currentUser && (
          <>
            <span className="navbar-welcome">Welcome, {currentUser.name || currentUser.email}</span>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
