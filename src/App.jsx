import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DeliveryPage from './pages/DeliveryPage';
import HelpPage from './pages/Help'; // Create this component
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-6">
        <nav className="mb-6">
          <ul className="flex space-x-4">
            <li>
              <Link 
                to="/" 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Delivery Tracker Optimisation
              </Link>
            </li>
            <li>
              <Link 
                to="/help" 
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Help Guide
              </Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<DeliveryPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;