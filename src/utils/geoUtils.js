
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const calculateETA = (distance, averageSpeed = 30) => {
  return Math.round((distance / averageSpeed) * 60);
};

export const sortTasksByDistance = (tasks, currentPosition) => {
  if (!currentPosition) return tasks;
  
  return [...tasks].sort((a, b) => {
    if (!a.coordinates || !b.coordinates) return 0;
    
    const distanceA = calculateDistance(
      currentPosition.latitude,
      currentPosition.longitude,
      a.coordinates.lat,
      a.coordinates.lng
    );
    
    const distanceB = calculateDistance(
      currentPosition.latitude,
      currentPosition.longitude,
      b.coordinates.lat,
      b.coordinates.lng
    );
    
    return distanceA - distanceB;
  });
};

export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=in&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('Address not found. Try being more specific (e.g., "Connaught Place, New Delhi")');
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};