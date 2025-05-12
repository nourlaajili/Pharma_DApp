import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Basket from "../components/Distributor/Basket";
import OrderList from "../components/Distributor/OrderList";
import axios from "axios";
import AvailableDrugs from "../components/Distributor/AvailableDrugs";

const DistributorPage = () => {
  const navigate = useNavigate();
  const { wallet } = useParams();
  const [activeTab, setActiveTab] = useState("inventory");
  const [basketItems, setBasketItems] = useState([]);
  const [availableDrugs, setAvailableDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch available drugs
  const fetchAvailableDrugs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        "http://localhost:5000/api/order/available",  // Fixed URL to match your route
        { withCredentials: true }
      );
      setAvailableDrugs(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch available drugs");
      console.error("Error fetching available drugs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableDrugs();
  }, []);

  // Function to add drug to basket
  const handleAddToBasket = (drug) => {
    setBasketItems(prevItems => {
      if (!prevItems.some(item => item._id === drug._id)) {
        return [...prevItems, drug];
      }
      return prevItems;
    });
    
    // Remove the drug from available drugs
    setAvailableDrugs(prevDrugs => 
      prevDrugs.filter(d => d._id !== drug._id)
    );
  };

  // Function to remove drug from basket
  const handleRemoveFromBasket = (drugId) => {
    setBasketItems(prevItems => {
      const removedItem = prevItems.find(item => item._id === drugId);
      if (removedItem) {
        // Add the drug back to available drugs
        setAvailableDrugs(prevDrugs => [...prevDrugs, removedItem]);
      }
      return prevItems.filter(item => item._id !== drugId);
    });
  };

  // Function to clear basket
  const handleClearBasket = () => {
    // Return all items to available drugs
    setAvailableDrugs(prevDrugs => [...prevDrugs, ...basketItems]);
    setBasketItems([]);
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Distributor Dashboard</h1>
      
      <ul className="nav nav-tabs justify-content-center mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            CentralPharmacy Inventory
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "order" ? "active" : ""}`}
            onClick={() => setActiveTab("order")}
          >
            My Orders ({basketItems.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            My Inventory
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === "inventory" && (
          <div className="col-md-12 mb-4">
            <AvailableDrugs 
              availableDrugs={availableDrugs}
              loading={loading}
              error={error}
              onAddToBasket={handleAddToBasket} 
            />
          </div>
        )}
        
        {activeTab === "order" && (
          <div className="col-md-12 mb-4">
            <Basket 
              basketItems={basketItems}
              onRemoveFromBasket={handleRemoveFromBasket}
              onClearBasket={handleClearBasket}
            />
          </div>
        )}
        
        {activeTab === "orders" && (
          <div className="col-md-12 mb-4">
            <OrderList wallet={wallet} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributorPage;