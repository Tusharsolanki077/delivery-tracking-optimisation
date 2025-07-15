import React from 'react';
import { MapPin, Clock, Battery, Wifi, Navigation, CheckCircle, AlertTriangle, Search, Plus, Settings, Zap, Globe, Activity } from 'lucide-react';

const Help = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        Delivery Tracking System Guide
      </h1>
      <p className="mb-6 text-gray-700 text-center text-lg">
        Welcome to the Delivery Tracking System Help Guide. This is just a basic prototype many things are 
        missing in it so please ignore them. This guide is designed to help you understand and effectively use 
        the tracking platform, from adding delivery tasks to managing performance modes and troubleshooting common issues.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
          <Navigation className="inline mr-2" />
          System Overview
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-blue-700">Key Features</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Real-time delivery task tracking</li>
              <li>Automatic ETA calculation (Just and basic one)</li>
              <li>Smart task prioritization by distance and ETA</li>
              <li>Battery & network-aware performance modes</li>
              <li>Offline capability with cached data</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-green-700">Technology Stack</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>React.js with Vite</li>
              <li>Browser Geolocation API</li>
              <li>Network Information API</li>
              <li>Background Tasks API (just used same flow)</li>
              <li>Battery Status API (Extra added for frontend)</li>
              <li>OpenStreetMap Nominatim for geocoding (extra)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
          <Zap className="inline mr-2" />
          Core Functionality & API Integration
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left font-semibold">Function</th>
                <th className="border border-gray-300 p-3 text-left font-semibold">Description</th>
                <th className="border border-gray-300 p-3 text-left font-semibold">API(s) Used</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-medium">Real-time location tracking</span>
                  </div>
                </td>
                <td className="border border-gray-300 p-3">Tracks the delivery agent's current location</td>
                <td className="border border-gray-300 p-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Geolocation API</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <div className="flex items-center">
                    <Navigation className="w-4 h-4 mr-2 text-green-500" />
                    <span className="font-medium">Continuous route updates</span>
                  </div>
                </td>
                <td className="border border-gray-300 p-3">ETA and optimal next task dynamically re-evaluated</td>
                <td className="border border-gray-300 p-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-1">Geolocation API</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">Background Tasks</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-orange-500" />
                    <span className="font-medium">Delivery task queue in background</span>
                  </div>
                </td>
                <td className="border border-gray-300 p-3">Background Task holds and processes delivery list (offline-capable)</td>
                <td className="border border-gray-300 p-3">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">Background Tasks API</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-red-500" />
                    <span className="font-medium">Dynamic ETA updates</span>
                  </div>
                </td>
                <td className="border border-gray-300 p-3">Based on real-time location and new traffic data (if online)</td>
                <td className="border border-gray-300 p-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-1">Geolocation</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Network Info</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <div className="flex items-center">
                    <Wifi className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">Fallback to cached ETAs</span>
                  </div>
                </td>
                <td className="border border-gray-300 p-3">Uses cached data when offline and refreshes when back online</td>
                <td className="border border-gray-300 p-3">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Network Info API</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-indigo-500" />
                    <span className="font-medium">Next best delivery decisioning</span>
                  </div>
                </td>
                <td className="border border-gray-300 p-3">System automatically picks next delivery location based on distance and ETA</td>
                <td className="border border-gray-300 p-3">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">Custom logic + Geolocation + Background Tasks</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <div className="flex items-center">
                    <Battery className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-medium">Battery/Data optimization</span>
                  </div>
                </td>
                <td className="border border-gray-300 p-3">Can throttle updates when battery is low or network is weak</td>
                <td className="border border-gray-300 p-3">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm mr-1">Network Info API</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Battery APIs</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
          <Globe className="inline mr-2" />
          API Status & Integration Details
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-bold text-lg mb-3 text-green-700">Primary APIs</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Geolocation API</span>
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Background Tasks API</span>
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network Information API</span>
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Active</span>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-lg mb-3 text-blue-700">Enhancement APIs</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Battery Status API</span>
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Frontend Only</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">OpenStreetMap Nominatim</span>
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">External</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Device APIs</span>
                <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">Optional</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
          <CheckCircle className="inline mr-2" />
          Getting Started
        </h2>
        
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="bg-yellow-100 text-yellow-800 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Adding Tasks</h3>
              <p className="mb-2">Add delivery tasks using either:</p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li><strong>Address search</strong> (requires internet)</li>
                <li><strong>Manual coordinates</strong> (works offline)</li>
              </ul>
              <div className="bg-gray-50 p-3 rounded-md text-sm">
                <div className="flex mb-2">
                  <input
                    type="text"
                    className="flex-1 border rounded px-3 py-2 mr-2"
                    placeholder="Task description"
                    readOnly
                  />
                  <button className="bg-blue-500 text-white px-3 py-2 rounded">
                    <Plus className="inline" />
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    Address
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                    Coordinates
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-yellow-100 text-yellow-800 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Starting Tracking</h3>
              <p>Once tasks are added, click the "Start Delivery Tracking" button to begin.</p>
              <div className="mt-2">
                <button className="bg-green-600 text-white px-4 py-2 rounded font-medium">
                  Start Delivery Tracking
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
          <MapPin className="inline mr-2" />
          Tracking Interface
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-3 text-lg flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Current Location
            </h3>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm">28.6129° N, 77.2295° E</p>
              <p className="text-xs text-gray-500">Accuracy: 15m</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-3 text-lg flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Next Delivery
            </h3>
            <div className="bg-green-50 p-3 rounded">
              <p className="font-medium">Office Supplies</p>
              <p className="text-sm">Connaught Place, New Delhi</p>
              <p className="text-xs">Distance: 2.4 km • ETA: 8 min</p>
            </div>
          </div>
        </div>

        <div className="mt-6 border rounded-lg p-4">
          <h3 className="font-bold mb-3 text-lg">Task Management</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className={`flex items-center p-3 rounded border ${
                i === 0 ? 'bg-blue-50 border-blue-200' : 'bg-white'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                  i === 1 ? 'bg-green-500 text-white' : 'border-2 border-gray-300'
                }`}>
                  {i === 1 && <CheckCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${i === 2 ? 'text-red-500 line-through' : ''}`}>
                    {i === 0 ? 'Office Supplies' : i === 1 ? 'Completed Task' : 'Cancelled Task'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {i === 0 ? 'Connaught Place' : i === 1 ? 'Delivered' : 'Customer cancelled'}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {i === 0 ? (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded">Next</span>
                  ) : i === 2 ? (
                    <span className="text-red-500">Cancelled</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
          <Battery className="inline mr-2" />
          Performance Modes
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="font-bold text-green-700 mb-2">High Accuracy</h3>
            <ul className="text-sm space-y-1">
              <li>• Updates every 5 seconds</li>
              <li>• Best for good battery/network</li>
              <li>• High precision location</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 bg-yellow-50">
            <h3 className="font-bold text-yellow-700 mb-2">Balanced</h3>
            <ul className="text-sm space-y-1">
              <li>• Updates every 10 seconds</li>
              <li>• Medium battery/network</li>
              <li>• Good precision</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 bg-red-50">
            <h3 className="font-bold text-red-700 mb-2">Battery Saver</h3>
            <ul className="text-sm space-y-1">
              <li>• Updates every 20 seconds</li>
              <li>• Low battery/poor network</li>
              <li>• Basic tracking</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          <AlertTriangle className="inline mr-2" />
          Troubleshooting
        </h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Location not updating?</h3>
            <p className="text-sm text-gray-600">Check browser permissions and ensure location services are enabled.</p>
          </div>
          <div>
            <h3 className="font-medium">Address search not working?</h3>
            <p className="text-sm text-gray-600">Internet connection is required for address geocoding.</p>
          </div>
          <div>
            <h3 className="font-medium">Battery draining fast?</h3>
            <p className="text-sm text-gray-600">Switch to Battery Saver mode in low power situations.</p>
          </div>
          <div>
            <h3 className="font-medium">Background tasks not working?</h3>
            <p className="text-sm text-gray-600">Ensure the browser tab remains active or enable background sync permissions.</p>
          </div>
          <div>
            <h3 className="font-medium">ETA calculations seem off?</h3>
            <p className="text-sm text-gray-600">ETAs are basic calculations. Real traffic data integration is planned for future updates.</p>
          </div>
        </div>
      </section>
      
      <div className="text-center text-sm text-gray-500 mt-10">
        Made with ❤️ by <span className="text-blue-600 font-medium">Tushar Solanki</span> •{' '}
        <a
          href="https://drive.google.com/file/d/1WXhO2cTLx7RPwfAU8BW_V0AGuxGKwDb0/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Resume
        </a>
      </div>
    </div>
  );
};

export default Help;