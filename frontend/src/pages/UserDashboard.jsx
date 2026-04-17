import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get(`/api/bookings/user/${user._id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setBookings(data);
      } catch (error) {
        console.error('Error fetching generic bookings', error);
      }
    };
    if (user) fetchBookings();
  }, [user]);

  const handleCancel = async (id) => {
    const confirm = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirm) return;

    try {
      await axios.put(`/api/bookings/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Update UI immediately
      setBookings(bookings.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      alert('Booking cancelled successfully.');
    } catch (error) {
      alert('Failed to cancel booking.');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>My Bookings</h1>
      
      <div className="glass-panel" style={{ padding: '30px', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: '10px' }}>Restaurant</th>
              <th style={{ padding: '10px' }}>Location</th>
              <th style={{ padding: '10px' }}>Table Number</th>
              <th style={{ padding: '10px' }}>Date</th>
              <th style={{ padding: '10px' }}>Time</th>
              <th style={{ padding: '10px' }}>Guests</th>
              <th style={{ padding: '10px' }}>Bill Total</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? bookings.map(b => (
              <tr key={b._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{b.restaurantId?.name || 'Unknown Restaurant'}</td>
                <td style={{ padding: '10px', color: '#555' }}>📍 {b.restaurantId?.location || 'Unknown'}</td>
                <td style={{ padding: '10px' }}>
                  {b.isTableAssigned ? (
                    b.tableId?.tableNumber || 'Unknown'
                  ) : (
                    <span style={{ fontSize: '0.9rem', color: '#888', fontStyle: 'italic' }}>Allocated at arrival time</span>
                  )}
                </td>
                <td style={{ padding: '10px' }}>{b.date}</td>
                <td style={{ padding: '10px' }}>{b.time}</td>
                <td style={{ padding: '10px' }}>{b.guests}</td>
                <td style={{ padding: '10px' }}>
                  {b.finalTotal !== undefined ? (
                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>${b.finalTotal.toFixed(2)}</strong>
                      {b.discountAmount > 0 && <div style={{ fontSize: '0.8rem', color: '#28a745' }}>Saved ${b.discountAmount.toFixed(2)}</div>}
                    </div>
                  ) : (
                    <span style={{ color: '#888' }}>Not Simulated</span>
                  )}
                </td>
                <td style={{ padding: '10px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem',
                    background: b.status === 'confirmed' ? '#d4edda' : b.status === 'cancelled' ? '#f8d7da' : '#e2e3e5',
                    color: b.status === 'confirmed' ? '#155724' : b.status === 'cancelled' ? '#721c24' : '#383d41'
                  }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>
                  {b.status === 'confirmed' && (
                    <button 
                      onClick={() => handleCancel(b._id)} 
                      style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="9" style={{ padding: '20px', textAlign: 'center' }}>You have no bookings yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDashboard;
