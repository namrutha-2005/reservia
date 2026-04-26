import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const RestaurantOwnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [restaurant, setRestaurant] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tables, setTables] = useState([]);
  
  // New restaurant form state
  const [newRestaurant, setNewRestaurant] = useState({ name: '', cuisine: '', location: '', description: '', image: '', openingTime: '10:00', closingTime: '22:00' });
  
  // New table form state
  const [newTable, setNewTable] = useState({ tableNumber: '', capacity: 4 });

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await axios.get('/api/restaurants/owner/me', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setRestaurant(data);
    } catch (error) {
       console.log('No restaurant found for this owner', error.response?.status);
    }
  };

  const fetchBookings = async () => {
    if (!user?.token || !restaurant) return;
    try {
      const { data } = await axios.get('/api/bookings/owner/my-restaurant-bookings', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setBookings(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTables = async () => {
    if (!restaurant) return;
    try {
      const { data } = await axios.get(`/api/tables/${restaurant._id}`);
      setTables(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMyRestaurant();
  }, [user]);

  useEffect(() => {
    if (restaurant) {
      fetchBookings();
      fetchTables();
    }
  }, [restaurant]);

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/restaurants', newRestaurant, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Restaurant created successfully!');
      fetchMyRestaurant();
    } catch (error) {
      console.error(error);
      alert('Error creating restaurant');
    }
  };

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/restaurants/${restaurant._id}`, restaurant, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Restaurant updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Error updating restaurant');
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tables', { ...newTable, restaurantId: restaurant._id }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNewTable({ tableNumber: '', capacity: 4 });
      fetchTables();
      alert('Table added successfully!');
    } catch (error) {
      console.error(error);
      alert('Error adding table');
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    try {
      await axios.delete(`/api/tables/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchTables();
    } catch (error) {
      console.error(error);
      alert('Error deleting table');
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      await axios.put(`/api/bookings/${id}/status`, { status: 'cancelled' }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchBookings();
      fetchTables();
    } catch (error) {
      console.error(error);
      alert('Error updating booking');
    }
  };

  const handleChangeBookingStatus = async (id, status, tableId) => {
    try {
      let payload = { status };
      if (status === 'checked-in' && !tableId) {
         const selectedTable = window.prompt("Advance booking has no table assigned. Enter Table Object ID to check-in (You can copy this from the tables list below):");
         if (!selectedTable) return alert("Table ID is required to check in.");
         payload.tableId = selectedTable;
      }
      await axios.put(`/api/bookings/${id}/status`, payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchBookings();
      fetchTables();
    } catch (error) {
       alert(error.response?.data?.message || 'Error updating status');
    }
  };

  if (!restaurant) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <h1 style={{ marginBottom: '30px', color: '#333' }}>Welcome, {user?.name}!</h1>
        <div className="glass-panel" style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
          <h2>Set Up Your Restaurant</h2>
          <p style={{ color: '#555', marginBottom: '20px' }}>You haven't setup your restaurant yet. Please fill in the details below.</p>
          <form onSubmit={handleCreateRestaurant}>
            <input type="text" placeholder="Restaurant Name" className="input-field" value={newRestaurant.name} onChange={e => setNewRestaurant({...newRestaurant, name: e.target.value})} required />
             <input type="text" placeholder="Cuisine (e.g., Italian, Indian)" className="input-field" value={newRestaurant.cuisine} onChange={e => setNewRestaurant({...newRestaurant, cuisine: e.target.value})} required />
             <input type="text" placeholder="Location / Place" className="input-field" value={newRestaurant.location} onChange={e => setNewRestaurant({...newRestaurant, location: e.target.value})} required />
             
             <div style={{ display: 'flex', gap: '15px' }}>
               <div style={{ flex: 1 }}>
                 <label style={{ fontSize: '0.85rem', color: '#555', marginLeft: '5px' }}>Opening Time</label>
                 <input type="time" className="input-field" value={newRestaurant.openingTime} onChange={e => setNewRestaurant({...newRestaurant, openingTime: e.target.value})} required />
               </div>
               <div style={{ flex: 1 }}>
                 <label style={{ fontSize: '0.85rem', color: '#555', marginLeft: '5px' }}>Closing Time</label>
                 <input type="time" className="input-field" value={newRestaurant.closingTime} onChange={e => setNewRestaurant({...newRestaurant, closingTime: e.target.value})} required />
               </div>
             </div>

             <textarea placeholder="Description" className="input-field" style={{ minHeight: '80px' }} value={newRestaurant.description} onChange={e => setNewRestaurant({...newRestaurant, description: e.target.value})} required />
             <input type="text" placeholder="Image URL" className="input-field" value={newRestaurant.image} onChange={e => setNewRestaurant({...newRestaurant, image: e.target.value})} />
             <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '15px' }}>Create Restaurant</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>Owner Dashboard: {restaurant.name}</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Left Column: Manage Restaurant Details & Tables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
             <div className="glass-panel" style={{ padding: '30px' }}>
               <h2>Update Details</h2>
               <form onSubmit={handleUpdateRestaurant} style={{ marginTop: '20px' }}>
                 <input type="text" placeholder="Restaurant Name" className="input-field" value={restaurant.name} onChange={e => setRestaurant({...restaurant, name: e.target.value})} required />
                 <input type="text" placeholder="Location" className="input-field" value={restaurant.location} onChange={e => setRestaurant({...restaurant, location: e.target.value})} required />
                 <div style={{ display: 'flex', gap: '15px' }}>
                   <div style={{ flex: 1 }}>
                     <label style={{ fontSize: '0.85rem', color: '#555', marginLeft: '5px' }}>Opening</label>
                     <input type="time" className="input-field" value={restaurant.openingTime} onChange={e => setRestaurant({...restaurant, openingTime: e.target.value})} required />
                   </div>
                   <div style={{ flex: 1 }}>
                     <label style={{ fontSize: '0.85rem', color: '#555', marginLeft: '5px' }}>Closing</label>
                     <input type="time" className="input-field" value={restaurant.closingTime} onChange={e => setRestaurant({...restaurant, closingTime: e.target.value})} required />
                   </div>
                 </div>
                 <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '15px' }}>Save Changes</button>
               </form>
             </div>

             <div className="glass-panel" style={{ padding: '30px' }}>
               <h2>Manage Tables</h2>
               <form onSubmit={handleAddTable} style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.4)', borderRadius: '8px' }}>
                 <h4 style={{ margin: '0 0 10px 0' }}>Add New Table</h4>
                 <input type="text" placeholder="Table Number (e.g., T1)" className="input-field" value={newTable.tableNumber} onChange={e => setNewTable({...newTable, tableNumber: e.target.value})} required />
                 <select className="input-field" value={newTable.capacity} onChange={e => setNewTable({...newTable, capacity: parseInt(e.target.value)})} required>
                   <option value={2}>2 Seats</option>
                   <option value={4}>4 Seats</option>
                   <option value={6}>6 Seats</option>
                   <option value={8}>8 Seats</option>
                   <option value={10}>10 Seats</option>
                 </select>
                 <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '15px' }}>Add Table</button>
               </form>

               {tables.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
                    {tables.map(t => (
                      <li key={t._id} style={{ padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                          <strong style={{ userSelect: 'all', cursor: 'grab' }}>Table {t.tableNumber}</strong> ({t.capacity} Seats)
                          <span style={{ marginLeft: '10px', padding: '3px 6px', borderRadius: '4px', fontSize: '0.8rem', background: t.status === 'occupied' ? '#f8d7da' : '#d4edda', color: t.status === 'occupied' ? '#721c24' : '#155724', fontWeight: 'bold' }}>
                            {t.status === 'occupied' ? 'Occupied' : 'Available'}
                          </span>
                          <br/>
                          <span style={{ fontSize: '0.7rem', color: '#aaa', userSelect: 'all' }}>ID: {t._id}</span>
                        </span>
                        <button onClick={() => handleDeleteTable(t._id)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                      </li>
                    ))}
                  </ul>
               )}
             </div>
        </div>

        {/* Right Column: Manage Bookings */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h2>Reservations</h2>
          <div style={{ marginTop: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ccc' }}>
                  <th style={{ padding: '10px' }}>Customer</th>
                  <th style={{ padding: '10px' }}>Date</th>
                  <th style={{ padding: '10px' }}>Time</th>
                  <th style={{ padding: '10px' }}>Guests</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{b.userId?.name || 'Unknown'}</td>
                    <td style={{ padding: '10px' }}>{b.date}</td>
                    <td style={{ padding: '10px' }}>{b.time}</td>
                    <td style={{ padding: '10px' }}>{b.guests}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem',
                        background: b.status === 'confirmed' ? '#d4edda' : b.status === 'cancelled' ? '#f8d7da' : b.status === 'checked-in' ? '#fff3cd' : '#e2e3e5',
                        color: b.status === 'confirmed' ? '#155724' : b.status === 'cancelled' ? '#721c24' : b.status === 'checked-in' ? '#856404' : '#383d41'
                      }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      {b.status === 'confirmed' && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => handleChangeBookingStatus(b._id, 'checked-in', b.tableId?._id)} style={{ background: '#28a745', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Check-In</button>
                          <button onClick={() => handleCancelBooking(b._id)} style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}>Reject</button>
                        </div>
                      )}
                      {b.status === 'checked-in' && (
                        <button onClick={() => handleChangeBookingStatus(b._id, 'completed')} style={{ background: '#007bff', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Mark Completed</button>
                      )}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No reservations yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantOwnerDashboard;
