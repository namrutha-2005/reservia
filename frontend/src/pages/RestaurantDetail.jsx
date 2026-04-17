import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const RestaurantDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(1);
  const [selectedTable, setSelectedTable] = useState(null);
  const [bookedTables, setBookedTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdvanceBooking, setIsAdvanceBooking] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const resRes = await axios.get(`/api/restaurants/${id}`);
        setRestaurant(resRes.data);
        
        const tabRes = await axios.get(`/api/tables/${id}`);
        
        // Deduplicate tables by tableNumber to fix the double rendering issue
        const uniqueTables = tabRes.data.filter((table, index, self) => 
          index === self.findIndex((t) => t.tableNumber === table.tableNumber)
        );
        setTables(uniqueTables);
      } catch (error) {
        console.error('Error fetching details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (date && time) {
      // Calculate immediate vs advance booking
      const bookingTime = new Date(`${date}T${time}`);
      const now = new Date();
      const diffHours = (bookingTime - now) / (1000 * 60 * 60);
      setIsAdvanceBooking(diffHours > 2);

      const fetchBooked = async () => {
        try {
          const { data } = await axios.get(`/api/bookings/restaurant/${id}/date/${date}`);
          setBookedTables(data);
        } catch (error) {
          console.error('Error fetching booked tables', error);
        }
      };
      
      fetchBooked();
      
      // Keep syncing with backend to ensure tables aggressively turn red for concurrent users
      const interval = setInterval(fetchBooked, 3000);
      return () => clearInterval(interval);
    }
  }, [date, time, id]);

  const handleBooking = async () => {
    if (!user) return navigate('/login');
    if (!date || !time) return alert('Please fill in date and time.');
    if (!isAdvanceBooking && !selectedTable) return alert('Please select a table for your immediate booking.');

    try {
      const { data } = await axios.post('/api/bookings', {
        restaurantId: id,
        tableId: isAdvanceBooking ? null : selectedTable._id,
        date,
        time,
        guests
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert(data.message);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating booking');
    }
  };

  const isTableBooked = (tableId) => {
    return bookedTables.some(b => {
      // Guard against advance bookings that have no table hooked
      if (!b.tableId) return false;
      
      // Strict string coercions for Mongoose ObjectId comparisons
      const bTableIdStr = String(b.tableId?._id || b.tableId);
      if (bTableIdStr !== String(tableId)) return false;

      // Time overlap calculation
      const toMinutes = (t) => {
        if (!t) return 0;
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      
      const bStart = toMinutes(b.time);
      const bEnd = bStart + (b.duration || 90); // Use duration from DB
      
      const selectStart = toMinutes(time);
      // Dynamically calculate slot requirements based on exact guests payload to match backend
      const expectedDuration = guests >= 5 ? 120 : 90;
      const selectEnd = selectStart + expectedDuration; 

      // True Time Overlap formula
      return Math.max(bStart, selectStart) < Math.min(bEnd, selectEnd);
    });
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  if (!restaurant) return <div>Restaurant not found</div>;

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px', display: 'flex', gap: '30px' }}>
        <img src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'} alt={restaurant.name} style={{ width: '300px', height: '200px', objectFit: 'cover', borderRadius: '15px' }} />
        <div>
          <h1 style={{ marginBottom: '10px' }}>{restaurant.name}</h1>
          <p style={{ color: '#fda085', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}>{restaurant.cuisine}</p>
          <p style={{ color: '#555', marginBottom: '20px' }}>{restaurant.description}</p>
          <p><strong>Open:</strong> {restaurant.openingTime} - {restaurant.closingTime}</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '30px' }}>
        <h2>Book a Table</h2>
        
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label>Date</label>
            <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label>Time</label>
            <input type="time" className="input-field" value={time} onChange={e => setTime(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label>Guests</label>
            <input type="number" className="input-field" value={guests} onChange={e => setGuests(parseInt(e.target.value))} min="1" max="20" />
          </div>
        </div>

        {date && time && (
          <div style={{ marginTop: '40px' }}>
            {isAdvanceBooking ? (
              <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '15px' }}>
                <h3 style={{ marginBottom: '15px', color: '#333' }}>📅 Advance Booking</h3>
                <p style={{ fontSize: '1.1rem', marginBottom: '25px', color: '#555' }}>Your booking is more than 2 hours away. The table will be allocated at your arrival time.</p>
                <button className="btn-primary" onClick={handleBooking} style={{ fontSize: '1.2rem', padding: '15px 40px' }}>
                  Confirm Advance Booking
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Select Your Table</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div className="table-node table-available" style={{ width: '20px', height: '20px' }}></div> Available</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div className="table-node table-booked" style={{ width: '20px', height: '20px' }}></div> Booked</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div className="table-node table-selected" style={{ width: '20px', height: '20px' }}></div> Selected</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '20px', justifyItems: 'center' }}>
                  {tables.map(table => {
                    // Strict Smart Filtering: Assign strictly to the exact nearest capacity (e.g. 1-2->2, 3-4->4) 
                    const requiredCapacity = guests % 2 === 0 ? guests : guests + 1;
                    if (table.capacity !== requiredCapacity) return null;

                    const booked = isTableBooked(table._id);
                    const selected = selectedTable?._id === table._id;
                    
                    let className = 'table-node table-available';
                    if (booked) className = 'table-node table-booked';
                    else if (selected) className = 'table-node table-selected';

                    return (
                      <div 
                        key={table._id} 
                        className={className} 
                        onClick={() => !booked && setSelectedTable(table)}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <div>T-{table.tableNumber}</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{table.capacity} Seats</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {selectedTable && (
                  <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
                      You have selected <strong>Table {selectedTable.tableNumber}</strong> ({selectedTable.capacity} Seats)
                    </p>
                    <button className="btn-primary" onClick={handleBooking} style={{ fontSize: '1.1rem', padding: '15px 40px' }}>
                      Confirm Immediate Booking
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;
