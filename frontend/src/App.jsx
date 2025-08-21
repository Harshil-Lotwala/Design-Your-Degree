import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DegreePlanner from './pages/planner/DegreePlanner';
import CourseCatalog from './pages/subjects/CourseCatalog';
import Login from './pages/login/Login';
import ForgotPassword from './pages/login/ForgotPassword';
import Signup from './pages/signup/Signup';
import PlanBuilderDashboard from './pages/dashboard/PlanBuilderDashboard';
import NavBar from './components/NavBar/NavBar';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <NavBar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/planner" element={<DegreePlanner user={user} />} />
        <Route path="/catalog" element={<CourseCatalog />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PlanBuilderDashboard user={user} setUser={setUser} />} />
      </Routes>
    </Router>
  );
}

export default App;
