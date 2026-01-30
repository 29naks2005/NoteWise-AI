import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SavedNotes from './pages/SavedNotes';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedNotes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
