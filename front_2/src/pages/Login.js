import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [wallet, setWallet] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Attempting to login with wallet:", wallet);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { wallet },
        { withCredentials: true }
      );
      console.log("Login response:", response.data);
  
      // Redirect based on role
      if (response.data.isAdmin) {
        navigate("/admin");
      } else if (response.data.role === "Manufacturer") {
        navigate("/drugs");
      } else if (response.data.role === "Distributor") {
        navigate("/distributor");
      } else {
        navigate("/drugs"); // Default route for other roles (if any)
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Wallet Address"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;