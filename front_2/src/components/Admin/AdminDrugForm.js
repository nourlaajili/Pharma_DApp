import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import walletConnectFcn from "../hedera/walletConnectFcn";
import contractExecuteFcn from "../hedera/contractExecuteFcn";

const AdminDrugForm = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [countryOfProvenance, setCountryOfProvenance] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pctCode, setPctCode] = useState("");
  const [wallet, setWallet] = useState("");
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const connectWallet = async () => {
    try {
      setLoading(true);
      const [selectedAccount, provider, network] = await walletConnectFcn();
      setWallet(selectedAccount);
      setProvider(provider);
      setError("");
    } catch (err) {
      setError("Failed to connect wallet");
      console.error("Error connecting wallet:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wallet || !provider) {
      setError("Wallet not connected");
      return;
    }
    if (!pctCode) {
      setError("PCT code is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Execute the contract function to submit drug as admin (on-chain)
      const [txHash] = await contractExecuteFcn(
        [wallet, provider, "testnet"],
        "submitDrugAsAdmin",
        [pctCode],
        100000
      );

      if (!txHash) {
        throw new Error("Transaction hash is undefined");
      }

      // Generate HashScan link
      const transactionId = txHash;
      const hashScanLink = `https://hashscan.io/testnet/transaction/${transactionId}`;

      // Prepare off-chain drug data
      const newDrug = {
        name,
        price: Number(price),
        expiryDate: Math.floor(new Date(expiryDate).getTime() / 1000),
        countryOfOrigin,
        countryOfProvenance,
        quantity: Number(quantity),
        transactionId,
        hashScanLink,
        currentHolder: wallet,
        pctCode,
        history: [{
          holder: wallet,
          timestamp: Math.floor(Date.now() / 1000),
          role: "CentralPharmacy"
        }],
        status: "Approved"
      };

      // Send the transaction ID and drug details to the backend
      const saveResponse = await axios.post(
        "http://localhost:5000/api/admin/save-admin-drug-data",
        newDrug,
        { withCredentials: true }
      );

      alert(`Drug submitted and approved successfully! 
             Transaction ID: ${transactionId}
             QR Code URL: http://localhost:5000${saveResponse.data.qrCodeUrl}`);
      
      // Clear form after successful submission
      setName("");
      setPrice("");
      setExpiryDate("");
      setCountryOfOrigin("");
      setCountryOfProvenance("");
      setQuantity("");
      setPctCode("");
      
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      console.error("Error submitting drug:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-drug-form">
      <h2>Admin Drug Submission</h2>
      {wallet ? (
        <div className="wallet-info">
          Connected as: {wallet}
        </div>
      ) : (
        <div className="wallet-status">
          {loading ? "Connecting wallet..." : "Wallet not connected"}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Drug Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Price</label>
          <input 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Expiry Date</label>
          <input 
            type="date" 
            value={expiryDate} 
            onChange={(e) => setExpiryDate(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Country of Origin</label>
          <input 
            type="text" 
            value={countryOfOrigin} 
            onChange={(e) => setCountryOfOrigin(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Country of Provenance</label>
          <input 
            type="text" 
            value={countryOfProvenance} 
            onChange={(e) => setCountryOfProvenance(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Quantity</label>
          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label>PCT Code</label>
          <select 
            value={pctCode} 
            onChange={(e) => setPctCode(e.target.value)} 
            required
          >
            <option value="">Select PCT Code</option>
            <option value="PCT01">PCT01</option>
            <option value="PCT02">PCT02</option>
            <option value="PCT03">PCT03</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading || !wallet}
          className="submit-button"
        >
          {loading ? 'Submitting...' : 'Submit Drug'}
        </button>

        {!wallet && (
          <button 
            type="button" 
            onClick={connectWallet} 
            disabled={loading}
            className="connect-button"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </form>
    </div>
  );
};

export default AdminDrugForm;