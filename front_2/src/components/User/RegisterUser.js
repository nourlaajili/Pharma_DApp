import React, { useState } from "react";
import axios from "axios";
import walletConnectFcn from "../hedera/walletConnectFcn";
import contractExecuteFcn from "../hedera/contractExecuteFcn";

const RegisterUser = () => {
  const [role, setRole] = useState("Manufacturer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [hashScanLink, setHashScanLink] = useState("");
  const [error, setError] = useState("");
  const [connectedWallet, setConnectedWallet] = useState("");
  const [provider, setProvider] = useState(null);
  const [network, setNetwork] = useState(null);

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      const [selectedAccount, provider, network] = await walletConnectFcn();
      setConnectedWallet(selectedAccount);
      setProvider(provider);
      setNetwork(network);
      setError("");
    } catch (err) {
      setError("Failed to connect wallet");
      console.error("Error connecting wallet:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!connectedWallet) {
      setError("Please connect your wallet first");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(connectedWallet)) {
      alert("Invalid wallet address");
      return;
    }

    if (!fullName || !email || !phone || !location) {
      setError("All fields are required");
      return;
    }

    try {
      const gasLimit = 1000000;
      const validRoles = ["Manufacturer", "Distributor", "PublicPharmacy", "PrivatePharmacy"];
      const roleIndex = validRoles.indexOf(role);

      if (roleIndex === -1) {
        throw new Error("Invalid role selected");
      }

      // Execute contract function
      const [txHash] = await contractExecuteFcn(
        [connectedWallet, provider, network],
        "registerUser",
        [connectedWallet, roleIndex],
        gasLimit
      );

      if (!txHash) {
        throw new Error("Transaction hash is undefined");
      }

      const transactionId = txHash;
      const hashScanLink = `https://hashscan.io/testnet/transaction/${transactionId}`;

      console.log("Transaction successful. HashScan link:", hashScanLink);

      // Send registration data to the backend
      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          wallet: connectedWallet,
          role,
          transactionId,
          hashScanLink,
          fullName,
          email,
          phone,
          location,
        },
        { withCredentials: true }
      );

      console.log("Backend response:", response.data);
      alert(`User registered successfully! Transaction ID: ${transactionId}`);
      setHashScanLink(hashScanLink);
    } catch (err) {
      console.error("Error registering user:", err);
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div className="register-user-container">
      <form onSubmit={handleSubmit} className="register-form">
        <button type="button" onClick={connectWallet}>
          Connect Wallet
        </button>
        {connectedWallet && <p>Connected Wallet: {connectedWallet}</p>}

        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          required
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          required
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Manufacturer">Manufacturer</option>
          <option value="Distributor">Distributor</option>
          <option value="PublicPharmacy">Public Pharmacy</option>
          <option value="PrivatePharmacy">Private Pharmacy</option>
        </select>

        <button type="submit">Register</button>
      </form>

      {hashScanLink && (
        <p>
          View transaction on{" "}
          <a href={hashScanLink} target="_blank" rel="noopener noreferrer">
            HashScan
          </a>
        </p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default RegisterUser;
