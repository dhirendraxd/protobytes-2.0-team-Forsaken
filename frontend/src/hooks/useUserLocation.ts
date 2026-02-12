import { useState, useEffect } from 'react';

interface LocationData {
  city: string;
  district: string;
  country: string;
  loading: boolean;
  error: string | null;
}

interface CachedLocation {
  data: LocationData;
  timestamp: number;
}

const CACHE_KEY = 'user_location_cache';
const CACHE_DURATION = 4 * 60 * 1000; // 4 minutes in milliseconds

export const useUserLocation = () => {
  const [location, setLocation] = useState<LocationData>({
    city: '',
    district: '',
    country: '',
    loading: true,
    error: null,
  });

  useEffect(() => {
    const getLocation = async () => {
      try {
        // Check cache first
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const cached: CachedLocation = JSON.parse(cachedData);
          const now = Date.now();
          
          // If cache is still valid (less than 4 minutes old)
          if (now - cached.timestamp < CACHE_DURATION) {
            setLocation(cached.data);
            return;
          }
        }

        // Get user's coordinates
        if (!navigator.geolocation) {
          setLocation(prev => ({
            ...prev,
            loading: false,
            error: 'Geolocation not supported',
          }));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              // Use OpenStreetMap Nominatim for reverse geocoding (free)
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
                { signal: AbortSignal.timeout(8000) }
              );
              
              if (!response.ok) {
                throw new Error(`Nominatim API returned ${response.status}`);
              }
              
              const data = await response.json();
              
              // Validate we have meaningful location data
              const city = data.address?.city || data.address?.town || data.address?.village;
              if (!city) {
                throw new Error('No location name found in response');
              }
              
              const locationData: LocationData = {
                city: city,
                district: data.address?.state_district || data.address?.county || '',
                country: data.address?.country || 'Nepal',
                loading: false,
                error: null,
              };
              
              // Cache the location data
              const cacheData: CachedLocation = {
                data: locationData,
                timestamp: Date.now(),
              };
              localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
              
              setLocation(locationData);
            } catch (error) {
              console.error('Error fetching location name:', error);
              // Use coordinates as fallback if available
              const fallbackData: LocationData = {
                city: `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`,
                district: 'GPS Coordinates',
                country: 'Nepal',
                loading: false,
                error: 'Location name unavailable (showing GPS coordinates)',
              };
              setLocation(fallbackData);
            }
          },
          (error) => {
            console.error('Error getting position:', error);
            const fallbackData: LocationData = {
              city: 'Nepal',
              district: '',
              country: 'Nepal',
              loading: false,
              error: 'Location access denied',
            };
            setLocation(fallbackData);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000, // Cache for 5 minutes
          }
        );
      } catch (error) {
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to get location',
        }));
      }
    };

    getLocation();
  }, []);

  return location;
};
