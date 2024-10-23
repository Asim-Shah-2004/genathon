// import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import LandingPage from './pages/LandingPage';
import Dashboard from '@/pages/Dashboard';

const App = () => {
  return (
    <div>
      <Toaster position="bottom-right" richColors />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </div>
  );
};

export default App;