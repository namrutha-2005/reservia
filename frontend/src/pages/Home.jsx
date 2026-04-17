import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data } = await axios.get('/api/restaurants');
        setRestaurants(data);
        const uniqueLocations = ['All', ...new Set(data.map(r => r.location).filter(Boolean))];
        setLocations(uniqueLocations);
      } catch (error) {
        console.error('Error fetching restaurants', error);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-bg" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: '800' }}>Find Your Perfect Table</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.9 }}>Experience smart dining with interactive table selection and real-time availability.</p>
        
        <div style={{ maxWidth: '400px', margin: '0 auto 30px auto' }}>
          <select 
            className="input-field" 
            style={{ color: '#333' }}
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            {locations.map((loc, idx) => (
              <option key={idx} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
            ))}
          </select>
        </div>

        <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '15px 30px' }} onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>
          Book a Table Now
        </button>
      </div>

      {/* Featured Restaurants */}
      <div className="container" style={{ padding: '60px 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2rem', color: '#333' }}>Featured Restaurants</h2>
        
        {restaurants.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#777' }}>No restaurants found. Please add some via the Admin Dashboard.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
            {restaurants
              .filter(r => selectedLocation === 'All' || r.location === selectedLocation)
              .map(restaurant => (
              <div key={restaurant._id} className="glass-panel restaurant-card" style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ height: '200px', width: '100%', background: `url(${restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'}) center/cover` }}></div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ marginBottom: '5px', fontSize: '1.4rem' }}>{restaurant.name}</h3>
                  <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '10px' }}>📍 {restaurant.location || 'Unknown'}</p>
                  <p style={{ color: '#666', marginBottom: '10px', fontWeight: '500' }}>{restaurant.cuisine}</p>
                  <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '20px', height: '40px', overflow: 'hidden' }}>{restaurant.description}</p>
                  <Link to={`/restaurant/${restaurant._id}`} className="btn-outline" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                    View & Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
