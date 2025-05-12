import React, { useState, useEffect } from "react";
import axios from "axios";
import walletConnectFcn from "../hedera/walletConnectFcn";
import contractExecuteFcn from "../hedera/contractExecuteFcn";

const Basket = ({ basketItems, onRemoveFromBasket, onClearBasket }) => {
  const [wallet, setWallet] = useState("");
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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

  const submitOrder = async () => {
    if (!wallet || !provider) {
      setError("Please connect your wallet first");
      return;
    }

    if (basketItems.length === 0) {
      setError("Your basket is empty");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Submit each drug in the basket
      for (const item of basketItems) {
        const itemId = parseInt(item._id.replace(/\D/g, '').slice(0, 10), 10);
        const [txHash] = await contractExecuteFcn(
          [wallet, provider, "testnet"],
          "requestOrder",
          [itemId],
          1000000
        );

        if (!txHash) {
          throw new Error(`Transaction failed for drug ${item.name}`);
        }

        await axios.post(
          `http://localhost:5000/api/order/${item._id}/request-order`,
          { 
            wallet,
            transactionId: txHash
          },
          { withCredentials: true }
        );
      }

      setSuccess(`Order submitted successfully!`);
      onClearBasket();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to submit order";
      setError(errorMsg);
      console.error("Order submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div className="basket-container">
      <h2>Your Order Basket</h2>
      
      {/* Wallet connection */}
      {!wallet ? (
        <button onClick={connectWallet} className="connect-button">
          Connect Wallet
        </button>
      ) : (
        <div className="wallet-info">Connected as: {wallet}</div>
      )}

      {/* Status messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Basket items */}
      {basketItems.length === 0 ? (
        <p>Your basket is empty</p>
      ) : (
        <>
          <table className="table-table">
            <thead>
              <tr>
                <th>Drug Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {basketItems.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.price}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <button 
                      onClick={() => onRemoveFromBasket(item._id)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="basket-actions">
            <button 
              onClick={submitOrder}
              disabled={loading || !wallet}
              className="submit-order-button"
            >
              {loading ? 'Submitting...' : 'Submit Order'}
            </button>
            <button 
              onClick={onClearBasket}
              className="clear-basket-button"
            >
              Clear Basket
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Basket;