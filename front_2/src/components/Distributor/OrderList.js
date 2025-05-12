import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import walletConnectFcn from "../hedera/walletConnectFcn";

const OrdersList = () => {
  const { wallet: paramWallet } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [wallet, setWallet] = useState("");
  const [provider, setProvider] = useState(null);
  const [walletError, setWalletError] = useState("");

  // Connect wallet function
  const connectWallet = async () => {
    try {
      setWalletError("");
      const [selectedAccount, provider] = await walletConnectFcn();
      setWallet(selectedAccount);
      setProvider(provider);
      return selectedAccount;
    } catch (err) {
      setWalletError("Failed to connect wallet");
      console.error("Wallet connection error:", err);
      return null;
    }
  };

  // Fetch orders function
  const fetchOrders = async (walletAddress) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `http://localhost:5000/api/order/orders/${walletAddress}`,
        { withCredentials: true }
      );
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Initial load effect
  useEffect(() => {
    const initialize = async () => {
      if (paramWallet) {
        setWallet(paramWallet);
        await fetchOrders(paramWallet);
      } else {
        const connectedWallet = await connectWallet();
        if (connectedWallet) {
          await fetchOrders(connectedWallet);
        }
      }
    };

    initialize();
  }, [paramWallet]);

  return (
    <div className="table-responsive">
      <h2 className="table-title">Your Orders</h2>
      
      {/* Wallet connection status */}
      {!paramWallet && (
        <div className="wallet-section">
          {wallet ? (
            <div className="wallet-info">
              <p>Connected as: {wallet}</p>
            </div>
          ) : (
            <div>
              <button onClick={connectWallet} className="connect-button">
                Connect Wallet
              </button>
              {walletError && <div className="error-message">{walletError}</div>}
            </div>
          )}
        </div>
      )}

      {/* Loading and error states */}
      {loading && <p>Loading orders...</p>}
      {error && <div className="error-message">{error}</div>}

      {/* Orders table */}
      {!loading && !error && orders.length === 0 ? (
        <p>You haven't placed any orders yet</p>
      ) : (
        <table className="table-table">
          <thead>
            <tr className="table-header-row">
              <th className="table-header">Drug Name</th>
              <th className="table-header">Status</th>
              <th className="table-header">Date</th>
              <th className="table-header">Transaction</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="table-row">
                <td className="table-cell">{order.drugId?.name || 'N/A'}</td>
                <td className="table-cell">
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td className="table-cell">
                  {new Date(order.timestamp).toLocaleDateString()}
                </td>
                <td className="table-cell">
                  <a
                    href={order.hashScanLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      
    </div>
  );
};

export default OrdersList;