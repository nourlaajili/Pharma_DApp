import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [wallet, setWallet] = useState("");
  const [role, setRole] = useState("manufacturer");
  const [hashScanLink, setHashScanLink] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", { wallet, role });
      alert(response.data.message);
      setHashScanLink(response.data.hashScanLink); // Set the HashScan link
      navigate("/login"); // Redirect to login page after registration
    } catch (err) {
      alert(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Wallet Address"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="manufacturer">Manufacturer</option>
        </select>
        <button type="submit">Register</button>
      </form>
      {hashScanLink && (
        <p>
          View registration transaction on{" "}
          <a href={hashScanLink} target="_blank" rel="noopener noreferrer">
            HashScan
          </a>
        </p>
      )}
    </div>
  );
};

export default Register;