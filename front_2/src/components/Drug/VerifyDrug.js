// components/Drug/VerifyDrug.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyDrug = () => {
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setVerificationResult(null);
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("qrImage", file);

      const response = await axios.post(
        "http://localhost:5000/api/drugs/verify",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setVerificationResult(response.data);
      
      if (response.data.success && response.data.drug) {
        setSuccessMessage("Verification successful! Redirecting to drug details...");
        
        // Show success message for 2 seconds before navigating
        setTimeout(() => {
          navigate(`/drugs/${response.data.drug.transactionId}`);
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed");
      console.error("Verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileUpload}
          disabled={loading}
          style={{ display: 'block', marginBottom: '10px' }}
        />
        <small>Upload a photo of the drug's QR code</small>
      </div>
      
      {loading && (
        <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '20px' }}>
          <p>Verifying QR code...</p>
        </div>
      )}
      
      {error && (
        <div style={{ padding: '10px', background: '#ffebee', color: '#d32f2f', borderRadius: '4px', marginBottom: '20px' }}>
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div style={{ padding: '10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', marginBottom: '20px' }}>
          <p>{successMessage}</p>
        </div>
      )}
      
      {verificationResult && !verificationResult.success && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#d32f2f' }}>Verification Failed</h3>
          <p>{verificationResult.message}</p>
          {verificationResult.ipfsMetadata && (
            <>
              <h4>IPFS Metadata (not found in database):</h4>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px',
                overflowX: 'auto'
              }}>
                {JSON.stringify(verificationResult.ipfsMetadata, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyDrug;