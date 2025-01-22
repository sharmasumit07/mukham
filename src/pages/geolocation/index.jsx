import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet
const Leaflet = dynamic(() => import('leaflet'), { ssr: false });

export default function MapPage() {
  const mapRef = useRef(null); // Reference to map instance
  const markerRef = useRef(null); // Reference to marker instance
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationName, setLocationName] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    let mapInstance;

    const initializeMap = async () => {
      // Dynamically load Leaflet
      const L = await Leaflet;

      // Check if the map is already initialized
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Initialize the map
      mapInstance = L.map('map').setView([20.5937, 78.9629], 5); // Center on India
      mapRef.current = mapInstance;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstance);

      // Add click event listener to the map
      mapInstance.on('click', (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        // Update coordinates in the state
        setLatitude(lat);
        setLongitude(lng);

        // Remove the old marker if it exists
        if (markerRef.current) {
          mapInstance.removeLayer(markerRef.current);
        }

        // Add a new marker to the clicked location
        markerRef.current = L.marker([lat, lng]).addTo(mapInstance);
      });
    };

    initializeMap();

    // Cleanup the map instance on component unmount
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!locationName.trim() || !latitude || !longitude) {
      alert('Please provide a location name and select a point on the map.');
      return;
    }

    // Store the submitted data
    const data = {
      location_name: locationName.trim(),
      latitude,
      longitude,
    };

    setSubmittedData(data);

    // Reset the form and map
    setLocationName('');
    setLatitude('');
    setLongitude('');

    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    alert('Location submitted successfully!');
  };

  return (
    <div>
      <h1>Select Location on Map</h1>
      <div id="map" style={{ height: '400px', marginBottom: '20px' }}></div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="location_name">Location Name:</label>
        <input
          type="text"
          id="location_name"
          name="location_name"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="Enter location name"
          required
        />
        <br />
        <input type="hidden" id="latitude" name="latitude" value={latitude} />
        <input type="hidden" id="longitude" name="longitude" value={longitude} />
        <p>
          <strong>Selected Coordinates:</strong> Latitude: {latitude || 'N/A'}, Longitude: {longitude || 'N/A'}
        </p>
        <button type="submit" style={{ marginTop: '10px' }}>Submit Location</button>
      </form>
      {submittedData && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid black' }}>
          <h2>Submitted Location Data:</h2>
          <p><strong>Location Name:</strong> {submittedData.location_name}</p>
          <p><strong>Latitude:</strong> {submittedData.latitude}</p>
          <p><strong>Longitude:</strong> {submittedData.longitude}</p>
        </div>
      )}
    </div>
  );
}
