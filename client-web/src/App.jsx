// import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import EmployeeCallLogs from '@/pages/Employee';

const App = () => {
  return (
    <div>
      <Toaster position="bottom-right" richColors />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/employee' element={<EmployeeCallLogs />} />
      </Routes>
    </div>
  );
};

export default App;