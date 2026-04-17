import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [restaurants, setRestaurants] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  // New restaurant form state
  const [newRestaurant, setNewRestaurant] = useState({ name: '', cuisine: '', location: '', description: '', image: '', openingTime: '10:00', closingTime: '22:00' });
  
  // New table form state
  const [newTable, setNewTable] = useState({ restaurantId: '', tableNumber: '', capacity: 2 });
  
  // Table Management state
  const [selectedRestForTables, setSelectedRestForTables] = useState('');
  const [manageTables, setManageTables] = useState([]);

  // Offers state
  const [offers, setOffers] = useState([]);
  const [newOffer, setNewOffer] = useState({ restaurantId: '', title: '', description: '', discountType: 'percentage', discountValue: 10, couponCode: '', minGuests: 1, validFrom: '', validTill: '', timeSlot: 'all' });

  const fetchRestaurants = async () => {
    const { data } = await axios.get('/api/restaurants');
    setRestaurants(data);
  };

  const fetchBookings = async () => {
    const token = user?.token;
    if (token) {
      const { data } = await axios.get('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(data);
    }
  };

  const fetchOffers = async () => {
    const token = user?.token;
    if (token) {
      const { data } = await axios.get('/api/offers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOffers(data);
    }
  };

  useEffect(() => {
    fetchRestaurants();
    fetchBookings();
    fetchOffers();
  }, [user]);

  useEffect(() => {
    if (selectedRestForTables) {
      axios.get(`/api/tables/${selectedRestForTables}`).then(res => setManageTables(res.data)).catch(console.error);
    } else {
      setManageTables([]);
    }
  }, [selectedRestForTables]);

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/restaurants', newRestaurant, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNewRestaurant({ name: '', cuisine: '', location: '', description: '', image: '', openingTime: '10:00', closingTime: '22:00' });
      fetchRestaurants();
      alert('Restaurant added successfully!');
    } catch (error) {
      alert('Error adding restaurant');
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTable.restaurantId) return alert('Please select a restaurant first');
    try {
      await axios.post('/api/tables', newTable, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNewTable({ restaurantId: newTable.restaurantId, tableNumber: '', capacity: 2 });
      if (selectedRestForTables === newTable.restaurantId) {
        axios.get(`/api/tables/${selectedRestForTables}`).then(res => setManageTables(res.data));
      }
      alert('Table added successfully!');
    } catch (error) {
      alert('Error adding table');
    }
  };

  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm('Are you sure you want to delete this restaurant? This will not automatically delete its bookings/tables.')) return;
    try {
      await axios.delete(`/api/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchRestaurants();
    } catch (error) {
      alert('Error deleting restaurant');
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    try {
      await axios.delete(`/api/tables/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setManageTables(manageTables.filter(t => t._id !== id));
    } catch (error) {
      alert('Error deleting table');
    }
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();
    if (!newOffer.restaurantId) return alert('Please select a restaurant first');
    try {
      await axios.post('/api/offers', newOffer, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNewOffer({ restaurantId: newOffer.restaurantId, title: '', description: '', discountType: 'percentage', discountValue: 10, couponCode: '', minGuests: 1, validFrom: '', validTill: '', timeSlot: 'all' });
      fetchOffers();
      alert('Offer added successfully!');
    } catch (error) {
      alert('Error adding offer');
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await axios.delete(`/api/offers/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchOffers();
    } catch (error) {
      alert('Error deleting offer');
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      await axios.put(`/api/bookings/${id}/status`, { status: 'cancelled' }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchBookings();
      if (selectedRestForTables) {
        axios.get(`/api/tables/${selectedRestForTables}`).then(res => setManageTables(res.data));
      }
    } catch (error) {
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
      if (selectedRestForTables) {
         axios.get(`/api/tables/${selectedRestForTables}`).then(res => setManageTables(res.data));
      }
    } catch (error) {
       alert(error.response?.data?.message || 'Error updating status');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>Admin Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Left Column: Manage Restaurants */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h2>Add Restaurant</h2>
          <form onSubmit={handleAddRestaurant} style={{ marginTop: '20px' }}>
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
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '15px' }}>Add Restaurant</button>
          </form>

          <h2 style={{ marginTop: '40px', marginBottom: '15px' }}>Existing Restaurants</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {restaurants.map(r => (
              <li key={r._id} style={{ padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{r.name}</strong> <span style={{ fontSize: '0.85rem', color: '#888' }}>({r.location || 'N/A'})</span>
                  <p style={{ color: '#777', fontSize: '0.9rem', margin: '2px 0 0 0' }}>{r.cuisine} | 🕒 {r.openingTime} - {r.closingTime}</p>
                </div>
                <button onClick={() => handleDeleteRestaurant(r._id)} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Delete</button>
              </li>
            ))}
          </ul>

          <h2 style={{ marginTop: '40px' }}>Manage & Add Tables</h2>
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Select Restaurant to Manage Tables:</label>
            <select className="input-field" value={selectedRestForTables} onChange={e => setSelectedRestForTables(e.target.value)}>
              <option value="">-- Choose a restaurant --</option>
              {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
            
            {manageTables.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px', background: 'rgba(255,255,255,0.3)', borderRadius: '8px' }}>
                {manageTables.map(t => (
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

          <form onSubmit={handleAddTable} style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.4)', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Add New Table</h4>
            <select className="input-field" value={newTable.restaurantId} onChange={e => setNewTable({...newTable, restaurantId: e.target.value})} required>
              <option value="">Select Restaurant...</option>
              {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
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

          <h2 style={{ marginTop: '40px' }}>Manage & Add Offers</h2>
          <form onSubmit={handleAddOffer} style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.4)', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Create New Offer</h4>
            <select className="input-field" value={newOffer.restaurantId} onChange={e => setNewOffer({...newOffer, restaurantId: e.target.value})} required>
              <option value="">Select Restaurant...</option>
              {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
            <input type="text" placeholder="Title (e.g., 20% OFF Dinner)" className="input-field" value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} required />
            <input type="text" placeholder="Description" className="input-field" value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} required />
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                 <select className="input-field" value={newOffer.discountType} onChange={e => setNewOffer({...newOffer, discountType: e.target.value})}>
                   <option value="percentage">Percentage (%)</option>
                   <option value="flat">Flat ($)</option>
                 </select>
              </div>
              <div style={{ flex: 1 }}>
                 <input type="number" placeholder="Value" className="input-field" value={newOffer.discountValue} onChange={e => setNewOffer({...newOffer, discountValue: Number(e.target.value)})} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                 <label style={{ fontSize: '0.85rem' }}>Valid From</label>
                 <input type="date" className="input-field" value={newOffer.validFrom} onChange={e => setNewOffer({...newOffer, validFrom: e.target.value})} required />
              </div>
              <div style={{ flex: 1 }}>
                 <label style={{ fontSize: '0.85rem' }}>Valid Till</label>
                 <input type="date" className="input-field" value={newOffer.validTill} onChange={e => setNewOffer({...newOffer, validTill: e.target.value})} required />
              </div>
            </div>

            <input type="text" placeholder="Coupon Code (Optional)" className="input-field" value={newOffer.couponCode} onChange={e => setNewOffer({...newOffer, couponCode: e.target.value})} />
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '15px' }}>Create Offer</button>
          </form>

          <div style={{ marginTop: '20px' }}>
             {offers.map(o => (
                <div key={o._id} style={{ padding: '15px', background: '#fff', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <strong>{o.title} <span style={{ color: 'green' }}>({o.discountType === 'percentage' ? o.discountValue + '%' : '$' + o.discountValue} OFF)</span></strong>
                     <button onClick={() => handleDeleteOffer(o._id)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', textDecoration: 'underline' }}>Delete</button>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                    {o.restaurantId?.name || 'Unknown'} | {o.validFrom} to {o.validTill} | Code: {o.couponCode || 'N/A'}
                  </div>
                </div>
             ))}
          </div>

        </div>

        {/* Right Column: Manage Bookings */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h2>All Bookings</h2>
          <div style={{ marginTop: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ccc' }}>
                  <th style={{ padding: '10px' }}>User</th>
                  <th style={{ padding: '10px' }}>Restaurant</th>
                  <th style={{ padding: '10px' }}>Date</th>
                  <th style={{ padding: '10px' }}>Time</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{b.userId?.name || 'Unknown'}</td>
                    <td style={{ padding: '10px' }}>{b.restaurantId?.name || 'Unknown'}</td>
                    <td style={{ padding: '10px' }}>{b.date}</td>
                    <td style={{ padding: '10px' }}>{b.time}</td>
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
                          <button onClick={() => handleCancelBooking(b._id)} style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}>Cancel</button>
                        </div>
                      )}
                      {b.status === 'checked-in' && (
                        <button onClick={() => handleChangeBookingStatus(b._id, 'completed')} style={{ background: '#007bff', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Mark Completed</button>
                      )}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No bookings found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
