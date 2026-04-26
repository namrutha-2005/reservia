import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const role = isOwner ? 'restaurant_owner' : 'customer';
      await signup(name, email, password, role);
      if (role === 'restaurant_owner') {
        navigate('/owner-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating account. Please try again later.');
    }
  };

  return (
    <div className="auth-bg">
      <div className="glass-panel" style={{ width: '400px', padding: '40px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Create Account</h2>
        {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', justifyContent: 'center' }}>
            <input 
              type="checkbox" 
              id="isOwner" 
              checked={isOwner} 
              onChange={(e) => setIsOwner(e.target.checked)} 
              style={{ marginRight: '8px' }}
            />
            <label htmlFor="isOwner" style={{ color: '#555', cursor: 'pointer' }}>Register as Restaurant Owner</label>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px', padding: '12px' }}>
            Sign Up
          </button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>
          Already have an account? <Link to="/login" style={{ color: '#fda085', fontWeight: 'bold' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
