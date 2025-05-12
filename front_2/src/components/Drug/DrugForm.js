import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import walletConnectFcn from "../hedera/walletConnectFcn";
import contractExecuteFcn from "../hedera/contractExecuteFcn";

const DrugForm = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [countryOfProvenance, setCountryOfProvenance] = useState("");
  const [quantity, setQuantity] = useState("");
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

    try {
      setLoading(true);
      setError("");

      const [txHash] = await contractExecuteFcn(
        [wallet, provider, "testnet"],
        "submitDrug",
        [],
        100000
      );

      if (!txHash) {
        throw new Error("Transaction hash is undefined");
      }

      const transactionId = txHash;
      const hashScanLink = `https://hashscan.io/testnet/transaction/${transactionId}`;

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
        history: [{
          holder: wallet,
          timestamp: Math.floor(Date.now() / 1000),
          role: "Manufacturer"
        }],
        status: "Pending"
      };

      const saveResponse = await axios.post(
        "http://localhost:5000/api/drugs/save-drug-data",
        newDrug,
        { withCredentials: true }
      );

      alert(`Drug submitted successfully! 
             Transaction ID: ${transactionId}
             QR Code URL: http://localhost:5000${saveResponse.data.qrCodeUrl}`);
      
      setName("");
      setPrice("");
      setExpiryDate("");
      setCountryOfOrigin("");
      setCountryOfProvenance("");
      setQuantity("");
      navigate("/drugs");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      console.error("Error submitting drug:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Submit New Drug</h2>
      {wallet ? (
        <div>Connected as: {wallet}</div>
      ) : (
        <div>
          {loading ? "Connecting wallet..." : "Wallet not connected"}
          {!loading && !wallet && (
            <button type="button" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Drug Name</label>
          <input 
            type="text" 
            placeholder="Enter drug name"
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>

        <div>
          <label>Price</label>
          <input 
            type="number" 
            placeholder="Enter price"
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            required 
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label>Expiry Date</label>
          <input 
            type="date" 
            value={expiryDate} 
            onChange={(e) => setExpiryDate(e.target.value)} 
            required 
          />
        </div>

        <div>
          <label>Country of Origin</label>
          <input 
            type="text" 
            placeholder="Enter country of origin"
            value={countryOfOrigin} 
            onChange={(e) => setCountryOfOrigin(e.target.value)} 
            required 
          />
        </div>

        <div>
          <label>Country of Provenance</label>
          <input 
            type="text" 
            placeholder="Enter country of provenance"
            value={countryOfProvenance} 
            onChange={(e) => setCountryOfProvenance(e.target.value)} 
            required 
          />
        </div>

        <div>
          <label>Quantity</label>
          <input 
            type="number" 
            placeholder="Enter quantity"
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            required 
            min="1"
          />
        </div>

        <button type="submit" disabled={loading || !wallet}>
          {loading ? 'Submitting...' : 'Submit Drug'}
        </button>
      </form>
    </div>
  );
};

export default DrugForm;