import React, { useEffect, useState } from "react";
import './App.css';
import './app2.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import DrugPage from "./pages/DrugPage";
import UserPage from "./pages/UserPage";
import DrugDetails from "./pages/DrugDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/HomePage";
import Navbar from "./components/Navbar";
import VerifyDrugPage from "./pages/VerifyDrugPage";
import DistributorPage from "./pages/DistributorPage";

function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Set initial theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      document.body.className = savedTheme;
    } else {
      document.body.className = 'dark';
    }
  }, []);

  return (
    <Router>
      <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode}/>
        <div className="center-card">
          <div className="transparent-card">
            <Routes>
              <Route path="/" element={<Home />} /> 
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/drugs" element={<DrugPage />} />
              <Route path="/users" element={<UserPage />} />
              <Route path="/drugs/:transactionId" element={<DrugDetails />} />
              <Route path="/verify" element={<VerifyDrugPage />} />
              <Route path="/distributor" element={<DistributorPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;