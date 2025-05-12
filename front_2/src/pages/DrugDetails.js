import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const DrugDetails = () => {
  const { transactionId } = useParams();
  const [drug, setDrug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDrugDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/drugs/${transactionId}`,
          { withCredentials: true }
        );
        
        const drugData = response.data;
        if (!drugData.history || !Array.isArray(drugData.history)) {
          drugData.history = [];
        }
        
        setDrug(drugData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch drug details");
        setLoading(false);
        console.error("Error fetching drug details:", err);
      }
    };

    fetchDrugDetails();
  }, [transactionId]);

  if (loading) return <p>Loading drug details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!drug) return <p>No drug found with the provided transaction ID.</p>;

  const qrCodeUrl = drug.qrCodePath 
    ? `http://localhost:5000/public${drug.qrCodePath}`
    : null;

  return (
    <div className="drug-details-container">
      <h2>Drug Details</h2>
      
      <div className="drug-details-grid">
        {/* Left column - Drug details */}
        <div className="drug-info-section">
          <div className="drug-info-card">
            <h3>Product Information</h3>
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{drug.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Price:</span>
              <span className="info-value">{drug.price}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Quantity:</span>
              <span className="info-value">{drug.quantity}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Expiry Date:</span>
              <span className="info-value">
                {new Date(drug.expiryDate * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Country of Origin:</span>
              <span className="info-value">{drug.countryOfOrigin}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Country of Provenance:</span>
              <span className="info-value">{drug.countryOfProvenance}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Current Holder:</span>
              <span className="info-value">{drug.currentHolder}</span>
            </div>
            <div className="info-row">
              <span className="info-label">PCT Code:</span>
              <span className="info-value">{drug.pctCode || "Not assigned"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className={`info-value status-${drug.status.toLowerCase()}`}>
                {drug.status || "Pending"}
              </span>
            </div>
          </div>

          <div className="transaction-info">
            <div className="info-row">
              <span className="info-label">Transaction ID:</span>
              <a 
                href={drug.hashScanLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hashscan-link"
              >
                {drug.transactionId}
              </a>
            </div>
            {drug.cid && (
              <div className="info-row">
                <span className="info-label">IPFS CID:</span>
                <span className="info-value">{drug.cid}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right column - QR Code */}
        <div className="qr-code-section">
          {qrCodeUrl ? (
            <div className="qr-code-card">
              <h3>Product QR Code</h3>
              <img 
                src={qrCodeUrl} 
                alt={`QR Code for ${drug.name}`} 
                className="qr-code-image"
              />
              <p className="qr-code-description">
                Scan this code to verify product authenticity
              </p>
              <a 
                href={qrCodeUrl} 
                download={`${drug.name}_qrcode.png`} 
                className="download-button"
              >
                Download QR Code
              </a>
            </div>
          ) : (
            <p className="no-qr-message">No QR code available</p>
          )}
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="history-section">
        <h3>Transaction History</h3>
        {drug.history && drug.history.length > 0 ? (
          <table className="table-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Role</th>
                <th>Holder</th>
              </tr>
            </thead>
            <tbody>
              {drug.history.map((entry, index) => (
                <tr key={index}>
                  <td>{new Date(entry.timestamp * 1000).toLocaleString()}</td>
                  <td>{entry.role || "Unknown role"}</td>
                  <td>{entry.holder || "Unknown holder"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No history available</p>
        )}
      </div>

      
    </div>
  );
};

export default DrugDetails;