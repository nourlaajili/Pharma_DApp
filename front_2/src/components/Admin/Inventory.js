import React, { useState, useEffect } from "react";
import axios from "axios";
import walletConnectFcn from "../hedera/walletConnectFcn";
import contractExecuteFcn from "../hedera/contractExecuteFcn";
import { Link } from "react-router-dom";

const Inventory = () => {
  const [inventoryDrugs, setInventoryDrugs] = useState([]); // Changed from inventory to inventoryDrugs
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fetchInventory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/inventory",
        { withCredentials: true }
      );
      setInventoryDrugs(response.data);
    } catch (err) {
            }
  };


  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div className="table-container">
      
      

      {/* Status messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Inventory Table */}
      <h2 style={{ marginTop: '40px' }}>Drug Inventory</h2>
      <table className="table-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>PCT Code</th>
            <th>Expiry Date</th>
            <th>Current Holder</th>
            <th>Transaction</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {inventoryDrugs.map((drug) => (
            <tr key={drug._id}>
              <td>{drug.name}</td>
              <td>{drug.price}</td>
              <td>{drug.quantity}</td>
              <td>{drug.pctCode}</td>
              <td>{new Date(drug.expiryDate * 1000).toLocaleDateString()}</td>
              <td>{drug.currentHolder}</td>
              <td>
                <a
                  href={drug.hashScanLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hashscan-link"
                >
                  View
                </a>
              </td>
              <td>
                <Link to={`/drugs/${drug.transactionId}`} className="details-link">
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;