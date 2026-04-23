import { useState, useEffect } from 'react';
import { register } from './api'; // ← ADD THIS
import {RegisterComponent} from './components/RegisterComponent';
import { Routes, Route, Navigate } from 'react-router-dom';



function App() {
  

  return (
    <Routes>
      <Route path="/register" element={<RegisterComponent />} />
      <Route path="*" element={<Navigate to="/register" />} />
    </Routes>
          )       
}

export default App;