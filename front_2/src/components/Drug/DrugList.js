import React from "react";
import { Link } from "react-router-dom";

const DrugList = ({ drugs }) => {
  return (
    <div className="table-container">
      <h2>Drug List</h2>
      <table className="table-table">
        <thead>
          <tr className="table-header-row">
            <th className="table-header">Name</th>
            <th className="table-header">Price</th>
            <th className="table-header">Quantity</th>
            <th className="table-header">Expiry Date</th>
            <th className="table-header">Country of Origin</th>
            <th className="table-header">Status</th>
            <th className="table-header">Transaction</th>
            <th className="table-header">Details</th>
          </tr>
        </thead>
        <tbody>
          {drugs.map((drug) => (
            <tr key={drug._id} className="table-row">
              <td className="table-cell">{drug.name}</td>
              <td className="table-cell">{drug.price}</td>
              <td className="table-cell">{drug.quantity}</td>
              <td className="table-cell">
                {new Date(drug.expiryDate * 1000).toLocaleDateString()}
              </td>
              <td className="table-cell">{drug.countryOfOrigin}</td>
              <td className="table-cell">
                <span className={`status-badge status-${drug.status.toLowerCase()}`}>
                  {drug.status}
                </span>
              </td>
              <td className="table-cell">
                {drug.hashScanLink && (
                  <a
                    href={drug.hashScanLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    View on HashScan
                  </a>
                )}
              </td>
              <td className="table-cell">
                <Link 
                  to={`/drugs/${drug.transactionId}`} 
                  className="internal-link"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* CSS Styles */}
      
    </div>
  );
};

export default DrugList;