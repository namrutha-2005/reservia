import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '15px 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#ff6b6b', fontSize: '24px', fontWeight: 'bold' }}>
          🍽️ Reservia
        </Link>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>Home</Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>Admin Panel</Link>
              )}
              {user.role === 'customer' && (
                <Link to="/dashboard" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>My Bookings</Link>
              )}
              <span style={{ fontWeight: '500', color: '#fda085' }}>Hello, {user.name}</span>
              <button onClick={handleLogout} className="btn-outline" style={{ padding: '5px 15px' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline">Login</Link>
              <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
