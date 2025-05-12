import React, { useState, useEffect } from "react";
import axios from "axios";
import walletConnectFcn from "../hedera/walletConnectFcn";
import contractExecuteFcn from "../hedera/contractExecuteFcn";
import { Link } from "react-router-dom";

const DrugApproval = () => {
  const [pendingDrugs, setPendingDrugs] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [pctCode, setPctCode] = useState("PCT01");
  const [wallet, setWallet] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(null);

  const connectWallet = async () => {
    try {
      const [selectedAccount, provider] = await walletConnectFcn();
      setWallet(selectedAccount);
      setProvider(provider);
      setError("");
    } catch (err) {
      setError("Failed to connect wallet");
      console.error("Wallet connection error:", err);
    }
  };

  const fetchPendingDrugs = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/pending", 
        { withCredentials: true }
      );
      setPendingDrugs(response.data);
    } catch (err) {
        console.error("Full error:", err);
    console.error("Error response:", err.response);
    setError(err.response?.data?.message || "Failed to fetch pending drugs");
      
    } finally {
      setLoading(false);
    }
  };



  const approveDrug = async () => {
    if (!selectedDrug) {
      setError("Please select a drug first");
      return;
    }
  
    if (!wallet || !provider) {
      setError("Please connect your wallet first");
      return;
    }
  
    if (!selectedDrug.id && !selectedDrug._id) {
      setError("Invalid drug ID");
      return;
    }
  
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const drugId = selectedDrug.id || parseInt(selectedDrug._id.replace(/\D/g, '').slice(0, 10), 10);
  
      const [txHash] = await contractExecuteFcn(
        [wallet, provider, "testnet"],
        "approveDrug",
        [drugId, pctCode],
        1000000
      );
  
      if (!txHash) {
        throw new Error("Transaction failed - no hash returned");
      }
  
      await axios.post(
        `http://localhost:5000/api/drugs/${selectedDrug.transactionId}/approve`,
        { 
          pctCode,
          transactionId: txHash,
          approvedBy: wallet,
          hashScanLink: `https://hashscan.io/testnet/transaction/${txHash}`
        },
        { withCredentials: true }
      );
  
      setSuccess(`Drug approved! Transaction ID: ${txHash}`);
      await fetchPendingDrugs();
      setSelectedDrug(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to approve drug";
      setError(errorMsg);
      console.error("Approval error:", err);
    } finally {
      setLoading(false);
    }
  };

  const rejectDrug = async () => {
    if (!selectedDrug) {
      setError("Please select a drug first");
      return;
    }
  
    if (!wallet || !provider) {
      setError("Please connect your wallet first");
      return;
    }
  
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const drugId = selectedDrug.id || parseInt(selectedDrug._id.replace(/\D/g, '').slice(0, 10), 10);
  
      const [txHash] = await contractExecuteFcn(
        [wallet, provider, "testnet"],
        "rejectDrug",
        [drugId],
        1000000
      );
  
      if (!txHash) {
        throw new Error("Transaction failed - no hash returned");
      }
  
      await axios.post(
        `http://localhost:5000/api/drugs/${selectedDrug.transactionId}/reject`,
        { 
          transactionId: txHash,
          rejectedBy: wallet,
          hashScanLink: `https://hashscan.io/testnet/transaction/${txHash}`
        },
        { withCredentials: true }
      );
  
      setSuccess(`Drug rejected successfully! Transaction ID: ${txHash}`);
      fetchPendingDrugs();
      setSelectedDrug(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to reject drug";
      setError(errorMsg);
      console.error("Rejection error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDrugs();
    connectWallet();
  }, []);

  return (
    <div className="table-container">
      {/* Wallet connection section */}
      <div className="wallet-section">
        {!wallet ? (
          <button onClick={connectWallet} disabled={loading} className="connect-button">
            Connect Wallet
          </button>
        ) : (
          <div className="wallet-info">Connected as: {wallet}</div>
        )}
      </div>

      {/* Status messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Pending Approvals Table */}
      <h2>Pending Drug Approvals</h2>
      <table className="table-table">
        <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Current Holder</th>
            <th>Transaction Details</th>
            <th>Date Submitted</th>
            <th>View Details</th>
          </tr>
        </thead>
        <tbody>
          {pendingDrugs.map((drug) => (
            <tr 
              key={drug._id} 
              className={selectedDrug?._id === drug._id ? 'selected-row' : ''}
              onClick={() => setSelectedDrug(drug)}
            >
              <td>
                <input 
                  type="radio" 
                  name="selectedDrug" 
                  checked={selectedDrug?._id === drug._id}
                  onChange={() => setSelectedDrug(drug)}
                />
              </td>
              <td>{drug.name}</td>
              <td>{drug.currentHolder}</td>
              <td>
                {drug.hashScanLink && (
                  <a
                    href={drug.hashScanLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hashscan-link"
                  >
                    View on HashScan
                  </a>
                )}
              </td>
              <td>
                {new Date(drug.createdAt).toLocaleDateString()}
              </td>
              <td>
                <Link to={`/drugs/${drug.transactionId}`} className="details-link">
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedDrug && (
        <div className="approval-controls">
          <div className="pct-selector">
            <label>PCT Classification:</label>
            <select
              value={pctCode} 
              onChange={(e) => setPctCode(e.target.value)}
              disabled={loading}
            >
              <option value="PCT01">PCT01 - Standard Pharmaceutical</option>
              <option value="PCT02">PCT02 - Controlled Substance</option>
              <option value="PCT03">PCT03 - Biologic Product</option>
            </select>
          </div>

          <div className="action-buttons">
            <button 
              className="approve-button"
              onClick={approveDrug} 
              disabled={loading}
            >
              {loading ? 'Approving...' : 'Approve Drug'}
            </button>
            <button 
              className="reject-button"
              onClick={rejectDrug} 
              disabled={loading}
            >
              {loading ? 'Rejecting...' : 'Reject Drug'}
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default DrugApproval;