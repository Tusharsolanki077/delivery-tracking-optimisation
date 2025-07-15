
export const getCurrentPosition = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(error),
      options
    );
  });
};

export const watchPosition = (callback, options = {}) => {
  if (!navigator.geolocation) {
    console.error('Geolocation not supported');
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => callback(position.coords),
    (error) => console.error('Geolocation error:', error),
    options
  );
};

export const clearPositionWatch = (watchId) => {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};