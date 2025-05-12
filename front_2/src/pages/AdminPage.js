import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ApprovedUsers from "../components/Admin/ApprovedUsers";
import DrugApproval from "../components/Admin/DrugApproval";
import Inventory from "../components/Admin/Inventory";
import AdminDrugForm from "../components/Admin/AdminDrugForm";
import OrderApproval from "../components/Admin/OrderApproval";
import OrdersList from "../components/Admin/OrdersList";
import axios from "axios";
import UserApproval from "../components/Admin/UserApproval";

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [orderSubTab, setOrderSubTab] = useState("pending");

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/check-admin", {
          withCredentials: true,
        });
        if (!response.data.isAdmin) {
          navigate("/login");
        }
      } catch (err) {
        navigate("/login");
      }
    };
    checkAdmin();
  }, [navigate]);

  // Custom styles for tabs
  const tabStyle = {
    default: {
      backgroundColor: "#f8f9fa",
      color: "#495057",
      border: "1px solid #dee2e6",
      borderBottom: "none",
      marginRight: "5px",
      borderRadius: "5px 5px 0 0",
      padding: "10px 20px",
      cursor: "pointer",
    },
    active: {
      backgroundColor: "#007bff",
      color: "white",
      border: "3px solid #1b2026",
      borderBottom: "none",
      marginRight: "5px",
      borderRadius: "5px 5px 0 0",
      padding: "10px 20px",
      cursor: "pointer",
    },
    subTab: {
      default: {
        backgroundColor: "#f8f9fa",
        color: "#495057",
        border: "1px solid #dee2e6",
        borderBottom: "none",
        marginRight: "5px",
        borderRadius: "5px 5px 0 0",
        padding: "8px 15px",
        cursor: "pointer",
      },
      active: {
        backgroundColor: "#28a745",
        color: "white",
        border: "3px solid #1b2026",
        borderBottom: "none",
        marginRight: "5px",
        borderRadius: "5px 5px 0 0",
        padding: "8px 15px",
        cursor: "pointer",
      }
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Admin Dashboard</h1>
      
      {/* Main Tabs Navigation */}
      <ul className="nav nav-tabs justify-content-center mb-4" style={{ borderBottom: "none" }}>
        <li className="nav-item">
          <button
            style={activeTab === "users" ? tabStyle.active : tabStyle.default}
            onClick={() => setActiveTab("users")}
          >
            User Management
          </button>
        </li>
        <li className="nav-item">
          <button
            style={activeTab === "drugs" ? tabStyle.active : tabStyle.default}
            onClick={() => setActiveTab("drugs")}
          >
            Drug Approvals
          </button>
        </li>
        <li className="nav-item">
          <button
            style={activeTab === "orders" ? tabStyle.active : tabStyle.default}
            onClick={() => setActiveTab("orders")}
          >
            Order Management
          </button>
        </li>
        <li className="nav-item">
          <button
            style={activeTab === "inventory" ? tabStyle.active : tabStyle.default}
            onClick={() => setActiveTab("inventory")}
          >
            Drug Inventory
          </button>
        </li>
        <li className="nav-item">
          <button
            style={activeTab === "addDrug" ? tabStyle.active : tabStyle.default}
            onClick={() => setActiveTab("addDrug")}
          >
            Add Drug (Admin)
          </button>
        </li>
      </ul>
      
      {/* Tab Contents */}
      <div className="tab-content">
        {/* User Management Tab */}
        {activeTab === "users" && (
          <div className="">
            <div className="col-md-12 mb-4">
              <div className="h-100">  
                <div className="">
                  <UserApproval />
                </div>
              </div>
            </div>
            
            <div className="col-md-12 mb-4">
              <div className="">
                <div className="">
                  <ApprovedUsers />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Drug Approvals Tab */}
        {activeTab === "drugs" && (
          <div className="">
            <div className="">
              <DrugApproval />
            </div>
          </div>
        )}
        
        {/* Order Management Tab */}
        {activeTab === "orders" && (
          <div className="">
            {/* Subtabs for Order Management */}
            <ul className="nav nav-tabs mb-3" style={{ borderBottom: "none" }}>
              <li className="nav-item">
                <button
                  style={orderSubTab === "pending" ? tabStyle.subTab.active : tabStyle.subTab.default}
                  onClick={() => setOrderSubTab("pending")}
                >
                  Pending Approvals
                </button>
              </li>
              <li className="nav-item">
                <button
                  style={orderSubTab === "all" ? tabStyle.subTab.active : tabStyle.subTab.default}
                  onClick={() => setOrderSubTab("all")}
                >
                  All Orders
                </button>
              </li>
            </ul>
            
            {/* Order Management Content */}
            <div className="tab-content">
              {orderSubTab === "pending" && (
                <div className="">
                  <OrderApproval />
                </div>
              )}
              
              {orderSubTab === "all" && (
                <div className="">
                  <OrdersList />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <div className="">
            <div className="">
              <Inventory />
            </div>
          </div>
        )}
        
        {/* Admin Drug Submission Tab */}
        {activeTab === "addDrug" && (
          <div className="">
            <div className="">
              <div className="">
                <AdminDrugForm />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;