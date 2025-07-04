import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Typography
} from '@mui/material';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import axios from 'axios';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '400px' };

const RecommendationPopup = ({ open, onClose }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCY5PAe4wMyAN86NzsQTvcJIoeiu6AvAhk', // your Google Maps API key
    libraries,
  });

  useEffect(() => {
    if (open) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await axios.post('http://localhost:5001/recommendations', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });

          console.log("📦 Full Recommendations Response:", res.data);
          console.log("🍴 Restaurants:", res.data.restaurants);
          console.log("🎵 Concerts:", res.data.concerts);
          console.log("🏟️ Sports:", res.data.sports);

          setRecommendations({ ...res.data, userLocation: pos.coords });
        } catch (err) {
          console.error('❌ Failed to load recommendations:', err);
        } finally {
          setLoading(false);
        }
      });
    }
  }, [open]);

  const renderMarkers = (items, color) =>
    items?.map((item, index) => {
      const coords = item.details;
  
      if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
        console.warn(`❌ Missing coordinates for: ${item.name}`, coords);
        return null;
      }
  
      console.log(`📍 Placing marker: ${item.name}`, coords);
  
      return (
        <Marker
          key={`${item.name}-${index}`}
          position={{ lat: coords.latitude, lng: coords.longitude }}
          icon={{
            url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
            scaledSize: new window.google.maps.Size(40, 40), // balloons visible
          }}
          title={item.name}
        />
      );
    });
  

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Recommended For You</DialogTitle>
      <DialogContent dividers>
        {loading || !isLoaded ? (
          <CircularProgress />
        ) : recommendations ? (
          <>
            <Typography variant="subtitle1" gutterBottom>
              {recommendations.summary}
            </Typography>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={13}
              center={{
                lat: recommendations.userLocation.latitude,
                lng: recommendations.userLocation.longitude,
              }}
            >
              {/* ✅ User Location Marker */}
              <Marker
                position={{
                  lat: recommendations.userLocation.latitude,
                  lng: recommendations.userLocation.longitude,
                }}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40), // ✅ Ensuring visibility
                }}
                title="Your Location"
              />

              {/* 🍴 Restaurants: Red */}
              {renderMarkers(recommendations.restaurants, 'red')}

              {/* 🎵 Concerts: Blue */}
              {renderMarkers(recommendations.concerts, 'blue')}

              {/* 🏟️ Sports: Orange */}
              {renderMarkers(recommendations.sports, 'orange')}
            </GoogleMap>
          </>
        ) : (
          <Typography>Failed to load recommendations.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationPopup;
