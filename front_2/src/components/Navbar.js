import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = ({ darkMode, setDarkMode }) => {
  

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.body.className = newTheme ? 'dark' : 'light';
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Pharma
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/users">
                Register
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/login">
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/verify">
                Verify Drug
              </Link>
            </li>
          </ul>
          <div className="form-check form-switch">
        <input 
          className="form-check-input" 
          type="checkbox" 
          id="themeToggle"
          checked={!darkMode}
          onChange={toggleTheme}
        />
        <label className="form-check-label" htmlFor="themeToggle">
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </label>
      </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;