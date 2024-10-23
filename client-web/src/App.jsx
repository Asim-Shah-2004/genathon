// import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import Dashboard from '@/pages/Dashboard';

const App = () => {
  return (
    <div>
      <Toaster position="bottom-right" richColors />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </div>
  );
};

export default App;