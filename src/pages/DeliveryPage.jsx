import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapPin, Clock, Battery, Wifi, Navigation, CheckCircle, Circle, AlertTriangle, Search, Plus } from 'lucide-react';
import {
  calculateDistance,
  calculateETA,
  sortTasksByDistance,
  geocodeAddress
} from '../utils/geoUtils';
import {
  watchPosition,
  clearPositionWatch
} from '../utils/locationUtils';//geo location api

const DeliveryPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskLat, setNewTaskLat] = useState('');
  const [newTaskLng, setNewTaskLng] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [inputMode, setInputMode] = useState('address');
  const [started, setStarted] = useState(false);
  const [position, setPosition] = useState(null);
  const [networkType, setNetworkType] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState(1);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [routeData, setRouteData] = useState({});
  const [cachedETAs, setCachedETAs] = useState({});
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);
  const [trackingMode, setTrackingMode] = useState('high');
  const [cancelledTasks, setCancelledTasks] = useState(new Set());
  const [geocodingError, setGeocodingError] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [allTasksCompleted, setAllTasksCompleted] = useState(false);
  
  const watcherRef = useRef(null);
  const backgroundTaskRef = useRef(null);
  const etaUpdateIntervalRef = useRef(null);

  // Network information api
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('connection' in navigator) {
      const conn = navigator.connection;
      setNetworkType(conn.effectiveType);
      const updateNetwork = () => setNetworkType(conn.effectiveType);
      conn.addEventListener('change', updateNetwork);
      return () => {
        conn.removeEventListener('change', updateNetwork);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Battery API , just extra thing to show on frontend
  useEffect(() => {
    const getBatteryInfo = async () => {
      try {
        if ('getBattery' in navigator) {
          const battery = await navigator.getBattery();
          setBatteryLevel(battery.level);

          const updateBattery = () => setBatteryLevel(battery.level);
          battery.addEventListener('levelchange', updateBattery);

          return () => battery.removeEventListener('levelchange', updateBattery);
        }
      } catch (err) {
        console.log('Battery API not available');
      }
    };

    getBatteryInfo();
  }, []);

  useEffect(() => {
    if (batteryLevel < 0.2 || networkType === 'slow-2g') {
      setTrackingMode('low');
    } else if (batteryLevel < 0.5 || networkType === '2g') {
      setTrackingMode('medium');
    } else {
      setTrackingMode('high');
    }
  }, [batteryLevel, networkType]);

  // Find next best delivery
  const findNextBestDelivery = useCallback(() => {
    if (!position || tasks.length === 0) return null;
    
    const incompleteTasks = tasks.filter((task, index) => 
      !task.completed && !cancelledTasks.has(index)
    );
    
    if (incompleteTasks.length === 0) return null;
    
    const sortedTasks = sortTasksByDistance(incompleteTasks, position);
    
    if (sortedTasks.length === 0) return null;
    
    const nearestTask = sortedTasks[0];
    const taskIndex = tasks.findIndex(t => 
      t.name === nearestTask.name && 
      t.coordinates.lat === nearestTask.coordinates.lat &&
      t.coordinates.lng === nearestTask.coordinates.lng
    );
    
    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      nearestTask.coordinates.lat,
      nearestTask.coordinates.lng
    );
    
    return { ...nearestTask, index: taskIndex, distance };
  }, [position, tasks, cancelledTasks]);

  // Update ETAs
  const updateETAs = useCallback(() => {
    if (!position) return;
    
    const updatedRouteData = {};
    const newCachedETAs = {};
    
    tasks.forEach((task, index) => {
      if (task.coordinates && !task.completed && !cancelledTasks.has(index)) {
        const distance = calculateDistance(
          position.latitude,
          position.longitude,
          task.coordinates.lat,
          task.coordinates.lng
        );
        
        const eta = calculateETA(distance);
        
        updatedRouteData[index] = {
          distance: distance.toFixed(2),
          eta: eta,
          lastUpdated: new Date().toISOString()
        };
        
        newCachedETAs[index] = {
          eta: eta,
          distance: distance.toFixed(2),
          cachedAt: new Date().toISOString()
        };
      }
    });
    
    setRouteData(updatedRouteData);
    setCachedETAs(prev => ({ ...prev, ...newCachedETAs }));
  }, [position, tasks, cancelledTasks]);

  // Background Tasks Simulation
  useEffect(() => {
    if (started && tasks.length > 0) {
      backgroundTaskRef.current = setInterval(() => {
        const nextTask = findNextBestDelivery();
        if (nextTask) {
          setCurrentTaskIndex(nextTask.index);
        }

        if (isOnline) {
          updateETAs();
        }
      }, trackingMode === 'high' ? 5000 : trackingMode === 'medium' ? 10000 : 20000);

      return () => {
        if (backgroundTaskRef.current) {
          clearInterval(backgroundTaskRef.current);
        }
      };
    }
  }, [started, tasks, findNextBestDelivery, updateETAs, trackingMode, isOnline]);

  // Geolocation API
  useEffect(() => {
    if (started) {
      const options = {
        enableHighAccuracy: trackingMode === 'high',
        maximumAge: trackingMode === 'high' ? 0 : trackingMode === 'medium' ? 30000 : 60000,
        timeout: trackingMode === 'high' ? 10000 : 20000
      };

      watcherRef.current = watchPosition(
        (coords) => {
          setPosition(coords);
          setLastLocationUpdate(new Date());
        },
        options
      );
    }

    return () => {
      if (watcherRef.current) {
        clearPositionWatch(watcherRef.current);
      }
    };
  }, [started, trackingMode]);

  // ETA Update Interval, set can be set according to needs
  useEffect(() => {
    if (started && isOnline) {
      etaUpdateIntervalRef.current = setInterval(updateETAs, 
        trackingMode === 'high' ? 30000 : trackingMode === 'medium' ? 60000 : 120000
      );

      return () => {
        if (etaUpdateIntervalRef.current) {
          clearInterval(etaUpdateIntervalRef.current);
        }
      };
    }
  }, [started, isOnline, updateETAs, trackingMode]);

  // Check for all tasks completion,
  useEffect(() => {
    const activeTasks = tasks.filter((_, idx) => !cancelledTasks.has(idx));
    const completedActiveTasks = activeTasks.filter(task => task.completed);
    
    if (started && activeTasks.length > 0 && completedActiveTasks.length === activeTasks.length) {
      setAllTasksCompleted(true);
    } else {
      setAllTasksCompleted(false);
    }
  }, [tasks, cancelledTasks, started]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    let coordinates = null;
    
    if (inputMode === 'address') {
      if (!addressInput.trim()) {
        setGeocodingError('Please enter an address');
        return;
      }
      
      if (!isOnline) {
        setGeocodingError('Address geocoding requires internet connection');
        return;
      }
      
      try {
        setIsGeocoding(true);
        setGeocodingError('');
        coordinates = await geocodeAddress(addressInput);
        if (!coordinates) return;
      } catch (error) {
        setGeocodingError(error.message);
        return;
      } finally {
        setIsGeocoding(false);
      }
    } else {
      const lat = parseFloat(newTaskLat);
      const lng = parseFloat(newTaskLng);
      
      if (isNaN(lat) || isNaN(lng)) {
        setGeocodingError('Please enter valid latitude and longitude');
        return;
      }
      
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setGeocodingError('Coordinates out of valid range');
        return;
      }
      
      coordinates = { lat, lng };
    }
    
    const newTaskObj = { 
      name: newTask, 
      completed: false,
      coordinates: coordinates,
      address: inputMode === 'address' ? addressInput : `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`,
      addedAt: new Date().toISOString()
    };
    
    setTasks(prev => {
      const newTasks = [...prev, newTaskObj];
      if (position) {
        return sortTasksByDistance(newTasks, position);
      }
      return newTasks;
    });
    
    setNewTask('');
    setAddressInput('');
    setNewTaskLat('');
    setNewTaskLng('');
    setGeocodingError('');
  };

  const handleStart = () => {
    if (tasks.length > 0) setStarted(true);
  };

  const handleCompleteTask = (index) => {
    setTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, completed: true, completedAt: new Date().toISOString() } : task
    ));
  };

  const handleCompleteAllTasks = () => {
    setTasks(prev => prev.map((task, index) => 
      !task.completed && !cancelledTasks.has(index) ? 
      { ...task, completed: true, completedAt: new Date().toISOString() } : 
      task
    ));
  };

  const handleCancelTask = (index) => {
    setCancelledTasks(prev => new Set([...prev, index]));
  };

  const handleResetTracking = () => {
    if (watcherRef.current) {
      clearPositionWatch(watcherRef.current);
      watcherRef.current = null;
    }
    if (backgroundTaskRef.current) {
      clearInterval(backgroundTaskRef.current);
      backgroundTaskRef.current = null;
    }
    if (etaUpdateIntervalRef.current) {
      clearInterval(etaUpdateIntervalRef.current);
      etaUpdateIntervalRef.current = null;
    }

    setStarted(false);
    setPosition(null);
    setCurrentTaskIndex(0);
    setRouteData({});
    setCachedETAs({});
    setLastLocationUpdate(null);
    setCancelledTasks(new Set());
    setTrackingMode('high');
    setAllTasksCompleted(false);
  };

  const handleClearAllTasks = () => {
    handleResetTracking();
    setTasks([]);
    setNewTask('');
    setAddressInput('');
    setNewTaskLat('');
    setNewTaskLng('');
    setGeocodingError('');
  };

  const useCurrentLocation = () => {
    if (position) {
      setNewTaskLat(position.latitude.toString());
      setNewTaskLng(position.longitude.toString());
      setInputMode('coordinates');
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (batteryLevel < 0.2) return 'text-orange-500';
    return 'text-green-500';
  };

  const getTrackingModeColor = () => {
    switch (trackingMode) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSortedTasks = useCallback(() => {
    if (!position) return tasks;
    return sortTasksByDistance(tasks, position);
  }, [position, tasks]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Advanced Delivery Tracker Optimisation
        </h1>

        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Wifi className={`w-4 h-4 ${getStatusColor()}`} />
              <span className="font-medium">Network:</span>
              <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                {isOnline ? networkType || 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Battery className={`w-4 h-4 ${batteryLevel < 0.2 ? 'text-red-500' : 'text-green-500'}`} />
              <span className="font-medium">Battery:</span>
              <span>{Math.round(batteryLevel * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className={`w-4 h-4 ${getTrackingModeColor()}`} />
              <span className="font-medium">Tracking:</span>
              <span className={getTrackingModeColor()}>{trackingMode}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Last Update:</span>
              <span className="text-xs">
                {lastLocationUpdate ? 
                  `${Math.floor((new Date() - lastLocationUpdate) / 1000)}s ago` : 
                  'Never'
                }
              </span>
            </div>
          </div>
        </div>

        {!started ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task name/description"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setInputMode('address')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  inputMode === 'address' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Address
              </button>
              <button
                onClick={() => setInputMode('coordinates')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  inputMode === 'coordinates' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Coordinates
              </button>
            </div>

            {inputMode === 'address' ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter delivery address"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  onClick={handleAddTask}
                  disabled={isGeocoding}
                >
                  {isGeocoding ? <Search className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Latitude"
                    value={newTaskLat}
                    onChange={(e) => setNewTaskLat(e.target.value)}
                  />
                  <input
                    type="number"
                    step="any"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Longitude"
                    value={newTaskLng}
                    onChange={(e) => setNewTaskLng(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={useCurrentLocation}
                    disabled={!position}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Use Current Location
                  </button>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    onClick={handleAddTask}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {geocodingError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 text-sm">{geocodingError}</span>
                </div>
              </div>
            )}

            {tasks.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">Pending Tasks ({tasks.filter(t => !cancelledTasks.has(tasks.indexOf(t))).length})</h3>
                  <button
                    onClick={handleClearAllTasks}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <ul className="space-y-2">
                  {getSortedTasks().map((task, idx) => {
                    const originalIndex = tasks.findIndex(t => 
                      t.name === task.name && 
                      t.coordinates.lat === task.coordinates.lat &&
                      t.coordinates.lng === task.coordinates.lng
                    );
                    
                    return (
                      <li key={originalIndex} className={`flex items-center justify-between gap-2 text-sm p-2 rounded ${
                        cancelledTasks.has(originalIndex) ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Circle className={`w-4 h-4 ${cancelledTasks.has(originalIndex) ? 'text-red-400' : 'text-gray-400'}`} />
                          <div>
                            <span className={cancelledTasks.has(originalIndex) ? 'text-red-500 line-through' : 'text-gray-800'}>
                              {task.name}
                            </span>
                            <div className="text-xs text-gray-500">
                              {task.address}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!cancelledTasks.has(originalIndex) && (
                            <button
                              onClick={() => handleCancelTask(originalIndex)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleStart}
                disabled={tasks.filter(t => !cancelledTasks.has(tasks.indexOf(t))).length === 0}
              >
                Start Delivery Tracking
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Location */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Current Location</h3>
              </div>
              <p className="text-sm text-gray-700">
                {position ? 
                  `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}` : 
                  'Locating...'
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Accuracy: {position ? `${position.accuracy.toFixed(0)}m` : 'N/A'}
              </p>
            </div>

            {(() => {
              const nextBest = findNextBestDelivery();
              return nextBest && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-800">Next Best Delivery</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{nextBest.name}</p>
                  <p className="text-xs text-gray-500 mb-1">{nextBest.address}</p>
                  <p className="text-xs text-gray-500">
                    Distance: {nextBest.distance.toFixed(2)} km | 
                    ETA: {routeData[nextBest.index]?.eta || 'Calculating...'} min
                  </p>
                </div>
              );
            })()}

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">Delivery Tasks</h3>
                <div className="flex gap-2">
                  {allTasksCompleted && (
                    <button
                      onClick={handleResetTracking}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Finish Delivery
                    </button>
                  )}
                  {!allTasksCompleted && (
                    <button
                      onClick={handleCompleteAllTasks}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      disabled={tasks.filter(t => !t.completed && !cancelledTasks.has(tasks.indexOf(t))).length === 0}
                    >
                      Complete All
                    </button>
                  )}
                  <button
                    onClick={handleResetTracking}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Reset Tracking
                  </button>
                  <button
                    onClick={handleClearAllTasks}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {getSortedTasks().map((task, idx) => {
                  const originalIndex = tasks.findIndex(t => 
                    t.name === task.name && 
                    t.coordinates.lat === task.coordinates.lat &&
                    t.coordinates.lng === task.coordinates.lng
                  );
                  
                  return (
                    <div key={originalIndex} className={`flex items-center gap-3 p-3 rounded-lg border ${
                      cancelledTasks.has(originalIndex) ? 'bg-red-50 border-red-200' :
                      task.completed ? 'bg-green-50 border-green-200' : 
                      originalIndex === currentTaskIndex ? 'bg-blue-50 border-blue-200' : 
                      'bg-white border-gray-200'
                    }`}>
                      <button
                        onClick={() => handleCompleteTask(originalIndex)}
                        disabled={cancelledTasks.has(originalIndex)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          cancelledTasks.has(originalIndex) ? 'bg-red-200 cursor-not-allowed' :
                          task.completed ? 'bg-green-500 text-white' : 
                          'border-2 border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {task.completed && <CheckCircle className="w-4 h-4" />}
                      </button>
                      
                      <div className="flex-1">
                        <p className={`font-medium ${
                          cancelledTasks.has(originalIndex) ? 'text-red-500 line-through' :
                          task.completed ? 'text-green-700 line-through' : 
                          'text-gray-800'
                        }`}>
                          {task.name}
                        </p>
                        <p className={`text-xs ${
                          cancelledTasks.has(originalIndex) ? 'text-red-400' :
                          task.completed ? 'text-green-600' : 
                          'text-gray-500'
                        }`}>
                          {task.address}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>
                            Distance: {routeData[originalIndex]?.distance || cachedETAs[originalIndex]?.distance || 'N/A'} km
                          </span>
                          <span>
                            ETA: {routeData[originalIndex]?.eta || cachedETAs[originalIndex]?.eta || 'N/A'} min
                          </span>
                          {!isOnline && cachedETAs[originalIndex] && (
                            <span className="flex items-center gap-1 text-orange-500">
                              <AlertTriangle className="w-3 h-3" />
                              Cached
                            </span>
                          )}
                          {cancelledTasks.has(originalIndex) && (
                            <span className="flex items-center gap-1 text-red-500">
                              <AlertTriangle className="w-3 h-3" />
                              Cancelled
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {originalIndex === currentTaskIndex && !task.completed && !cancelledTasks.has(originalIndex) && (
                          <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                            Next
                          </div>
                        )}
                        {!task.completed && !cancelledTasks.has(originalIndex) && (
                          <button
                            onClick={() => handleCancelTask(originalIndex)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-semibold text-gray-700 mb-2">Completed</h4>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.completed).length}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-semibold text-gray-700 mb-2">Cancelled</h4>
                <p className="text-2xl font-bold text-red-600">
                  {cancelledTasks.size}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-semibold text-gray-700 mb-2">Remaining</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {tasks.filter((t, idx) => !t.completed && !cancelledTasks.has(idx)).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPage;