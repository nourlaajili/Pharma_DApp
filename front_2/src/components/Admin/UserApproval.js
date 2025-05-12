// components/UserApproval.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import walletConnectFcn from "../hedera/walletConnectFcn";
import contractExecuteFcn from "../hedera/contractExecuteFcn";

const UserApproval = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
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

  const fetchPendingRequests = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/pending-requests", 
        { withCredentials: true }
      );
      setPendingRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch pending requests");
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async () => {
    if (!selectedUser) {
      setError("Please select a user first");
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

      // Execute contract function
      const [txHash] = await contractExecuteFcn(
        [wallet, provider, "testnet"],
        "approveUser",
        [selectedUser.wallet],
        1000000
      );
  
      if (!txHash) {
        throw new Error("Transaction failed - no hash returned");
      }
  
      // Update backend
      const response = await axios.post(
        "http://localhost:5000/api/admin/approve-user",
        { 
          wallet: selectedUser.wallet,
          hashScanLink: `https://hashscan.io/testnet/transaction/${txHash}`
        },
        { withCredentials: true }
      );
  
      setSuccess(`User approved! Transaction ID: ${txHash}`);
      await fetchPendingRequests();
      setSelectedUser(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to approve user";
      setError(errorMsg);
      console.error("Approval error:", err);
    } finally {
      setLoading(false);
    }
  };

  const rejectUser = async () => {
    if (!selectedUser) {
      setError("Please select a user first");
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

      // Execute contract function
      const [txHash] = await contractExecuteFcn(
        [wallet, provider, "testnet"],
        "rejectUser",
        [selectedUser.wallet],
        1000000
      );
  
      if (!txHash) {
        throw new Error("Transaction failed - no hash returned");
      }
  
      // Update backend
      const response = await axios.post(
        "http://localhost:5000/api/admin/reject-user",
        { 
          wallet: selectedUser.wallet,
          hashScanLink: `https://hashscan.io/testnet/transaction/${txHash}`
        },
        { withCredentials: true }
      );
  
      setSuccess(`User rejected! Transaction ID: ${txHash}`);
      await fetchPendingRequests();
      setSelectedUser(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to reject user";
      setError(errorMsg);
      console.error("Rejection error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
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

      {/* Pending Requests Table */}
      <h2>Pending User Approvals</h2>
      <table className="table-table">
        <thead>
          <tr>
            <th>Select</th>
            <th>Wallet</th>
            <th>Role</th>
            <th>Registration Transaction</th>
            <th>Date Submitted</th>
          </tr>
        </thead>
        <tbody>
          {pendingRequests.map((request) => (
            <tr 
              key={request._id} 
              className={selectedUser?._id === request._id ? 'selected-row' : ''}
              onClick={() => setSelectedUser(request)}
            >
              <td>
                <input 
                  type="radio" 
                  name="selectedUser" 
                  checked={selectedUser?._id === request._id}
                  onChange={() => setSelectedUser(request)}
                />
              </td>
              <td>{request.wallet}</td>
              <td>{request.role}</td>
              <td>
                {request.registrationHashScanLink && (
                  <a
                    href={request.registrationHashScanLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hashscan-link"
                  >
                    View on HashScan
                  </a>
                )}
              </td>
              <td>
                {new Date(request.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div className="approval-controls">
          <div className="action-buttons">
            <button 
              className="approve-button"
              onClick={approveUser} 
              disabled={loading}
            >
              {loading ? 'Approving...' : 'Approve User'}
            </button>
            <button 
              className="reject-button"
              onClick={rejectUser} 
              disabled={loading}
            >
              {loading ? 'Rejecting...' : 'Reject User'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserApproval;