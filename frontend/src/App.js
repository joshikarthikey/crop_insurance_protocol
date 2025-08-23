import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import InsurancePools from './pages/InsurancePools';
import CreatePool from './pages/CreatePool';
import PoolDetails from './pages/PoolDetails';
import SubmitClaim from './pages/SubmitClaim';
import Claims from './pages/Claims';
import Weather from './pages/Weather';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import { ContractProvider } from './contexts/ContractContext';

import './App.css';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthProvider>
        <ContractProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pools" element={<InsurancePools />} />
              <Route path="/pools/create" element={<CreatePool />} />
              <Route path="/pools/:poolId" element={<PoolDetails />} />
              <Route path="/claims" element={<Claims />} />
              <Route path="/claims/submit" element={<SubmitClaim />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ContractProvider>
      </AuthProvider>
    </div>
  );
};

export default App;
