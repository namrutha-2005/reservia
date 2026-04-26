import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(`[Frontend Login] Requesting login for: ${email}`);
    try {
      const user = await login(email, password);
      console.log(`[Frontend Login] Success! Redirecting role: ${user.role}`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'restaurant_owner') {
        navigate('/owner-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid email or password';
      console.error(`[Frontend Login] Failed:`, errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div className="auth-bg">
      <div className="glass-panel" style={{ width: '400px', padding: '40px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Welcome Back</h2>
        {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px', padding: '12px' }}>
            Login
          </button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#fda085', fontWeight: 'bold' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
