import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/admin/orders",
        { withCredentials: true }
      );
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="table-responsive">
      <h2 className="table-title">All Orders</h2>
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <table className="table-table">
          <thead>
            <tr className="table-header-row">
              <th className="table-header">Drug Name</th>
              <th className="table-header">Distributor</th>
              <th className="table-header">Status</th>
              <th className="table-header">Date</th>
              <th className="table-header">Transaction</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id} className="table-row">
                  <td className="table-cell">{order.drugId?.name}</td>
                  <td className="table-cell">{order.distributorName || order.distributor}</td>
                  <td className="table-cell">
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                      {order.status === "Rejected" && order.rejectionReason && (
                        <span className="rejection-tooltip">
                          Reason: {order.rejectionReason}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="table-cell">
                    {new Date(order.createdAt).toLocaleDateString()}
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
              ))
            ) : (
              <tr className="table-row">
                <td className="table-cell" colSpan="5" style={{ textAlign: 'center' }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <style jsx>{`
        .table-responsive {
          width: 100%;
          overflow-x: auto;
          margin: 1.5rem 0;
          padding: 0 1rem;
        }
        
        .table-title {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0.5rem;
          font-size: 0.9rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .table-header {
          padding: 0.75rem 1rem;
          text-align: left;
          background-color: #f8f9fa;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
        }
        
        .table-cell {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #dee2e6;
          vertical-align: middle;
        }
        
        .table-row:hover {
          background-color: #f8f9fa;
        }
        
        .external-link {
          color: #0d6efd;
          text-decoration: none;
          transition: color 0.15s ease-in-out;
        }
        
        .external-link:hover {
          color: #0a58ca;
          text-decoration: underline;
        }
        
        /* Status Badges */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
          position: relative;
        }
        
        
        .status-rejected {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .status-delivered {
          background-color: #cce5ff;
          color: #004085;
        }
        
        .status-processing {
          background-color: #e2e3e5;
          color: #383d41;
        }
        
        .rejection-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background-color: #721c24;
          color: white;
          padding: 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          z-index: 10;
        }
        
        .status-badge:hover .rejection-tooltip {
          opacity: 1;
          visibility: visible;
          bottom: calc(100% + 5px);
        }
        
        .error-message {
          color: #dc3545;
          padding: 0.75rem;
          margin-bottom: 1rem;
          background-color: #f8d7da;
          border-radius: 0.25rem;
          border: 1px solid #f5c6cb;
        }
      `}</style>
    </div>
  );
};

export default OrdersList;