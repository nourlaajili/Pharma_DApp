// src/components/OrderApproval.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import walletConnectFcn from "../hedera/walletConnectFcn";
import contractExecuteFcn from "../hedera/contractExecuteFcn";
import { Link } from "react-router-dom";

const OrderApproval = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [wallet, setWallet] = useState("");
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

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

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/admin/orders/pending",
        { withCredentials: true }
      );
      setPendingOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch pending orders");
    } finally {
      setLoading(false);
    }
  };

  const approveOrder = async () => {
    if (!selectedOrder) {
      setError("Please select an order first");
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

      // Execute smart contract function
      const [txHash] = await contractExecuteFcn(
        [wallet, provider, "testnet"],
        "approveOrder",
        [selectedOrder.orderId],
        1000000
      );

      if (!txHash) {
        throw new Error("Transaction failed - no hash returned");
      }

      // Update backend
      await axios.put(
        `http://localhost:5000/api/admin/orders/${selectedOrder._id}/approve`,
        {
          transactionId: txHash,
          approvedBy: wallet
        },
        { withCredentials: true }
      );

      setSuccess(`Order approved! Transaction ID: ${txHash}`);
      fetchPendingOrders();
      setSelectedOrder(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to approve order");
      console.error("Approval error:", err);
    } finally {
      setLoading(false);
    }
  };

  const rejectOrder = async () => {
    if (!selectedOrder) {
      setError("Please select an order first");
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

      // Execute smart contract function
      const [txHash] = await contractExecuteFcn(
        [wallet, provider, "testnet"],
        "rejectOrder",
        [selectedOrder.orderId],
        1000000
      );

      if (!txHash) {
        throw new Error("Transaction failed - no hash returned");
      }

      // Update backend
      await axios.put(
        `http://localhost:5000/api/admin/orders/${selectedOrder._id}/reject`,
        {
          transactionId: txHash,
          approvedBy: wallet,
          rejectionReason
        },
        { withCredentials: true }
      );

      setSuccess(`Order rejected! Transaction ID: ${txHash}`);
      fetchPendingOrders();
      setSelectedOrder(null);
      setRejectionReason("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to reject order");
      console.error("Rejection error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    connectWallet();
    fetchPendingOrders();
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

      {/* Pending Orders Table */}
      <h2>Pending Order Approvals</h2>
      <table className="table-table">
        <thead>
          <tr>
            <th>Select</th>
            <th>Drug Name</th>
            <th>Distributor</th>
            <th>Quantity</th>
            
            <th>Order Date</th>
            <th>Transaction</th>
          </tr>
        </thead>
        <tbody>
          {pendingOrders.map((order) => (
            <tr 
              key={order._id} 
              className={selectedOrder?._id === order._id ? 'selected-row' : ''}
              onClick={() => setSelectedOrder(order)}
            >
              <td>
                <input 
                  type="radio" 
                  name="selectedOrder" 
                  checked={selectedOrder?._id === order._id}
                  onChange={() => setSelectedOrder(order)}
                />
              </td>
              <td>{order.drugId?.name}</td>
              <td>{order.distributorName || order.distributor}</td>
              <td>{order.drugId?.quantity}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>
                <a
                  href={order.hashScanLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hashscan-link"
                >
                  View Transaction
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedOrder && (
        <div className="approval-controls">
          <div className="rejection-reason">
            <label>Rejection Reason (if rejecting):</label>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Optional reason for rejection"
            />
          </div>

          <div className="action-buttons">
            <button 
              className="approve-button"
              onClick={approveOrder} 
              disabled={loading}
            >
              {loading ? 'Approving...' : 'Approve Order'}
            </button>
            <button 
              className="reject-button"
              onClick={rejectOrder} 
              disabled={loading}
            >
              {loading ? 'Rejecting...' : 'Reject Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderApproval;