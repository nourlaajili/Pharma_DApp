import React, { useEffect, useState } from "react";
import axios from "axios";

const ApprovedUsers = () => {
  const [approvedUsers, setApprovedUsers] = useState([]);

  useEffect(() => {
    const fetchApprovedUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/approved-users", {
          withCredentials: true, // Include session cookie
        });
        setApprovedUsers(response.data);
      } catch (err) {
        console.error("Error fetching approved users:", err);
      }
    };

    fetchApprovedUsers();
  }, []);

  return (
    <div className="table-container">
    <h2>Approved Users</h2>
    <table className="table-table">
      <thead>
        <tr>
          <th>Wallet</th>
          <th>Role</th>
          <th>Approval Transaction</th>
        </tr>
      </thead>
      <tbody>
        {approvedUsers.map((user) => (
          <tr key={user._id}>
            <td>{user.wallet}</td>
            <td>{user.role}</td>
            <td>
              {user.approvalHashScanLink && (
                <a
                  href={user.approvalHashScanLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hashscan-link"
                >
                  View on HashScan
                </a>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
};

export default ApprovedUsers;