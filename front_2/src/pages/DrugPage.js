import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DrugForm from "../components/Drug/DrugForm";
import DrugList from "../components/Drug/DrugList";
import axios from "axios";
import Inventory from "../components/Drug/Inventory";

const DrugPage = () => {
  const [drugs, setDrugs] = useState([]);
  const navigate = useNavigate();

  // Check if the user is an approved manufacturer
  useEffect(() => {
    const checkManufacturer = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/check-manufacturer", {
          withCredentials: true,
        });
        if (!response.data.isApproved) {
          navigate("/login");
        }
      } catch (err) {
        navigate("/login");
      }
    };
    checkManufacturer();
  }, [navigate]);

  // Fetch drugs from the backend
  const fetchDrugs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/drugs", {
        withCredentials: true,
      });
      setDrugs(response.data);
    } catch (err) {
      console.error("Error fetching drugs:", err);
    }
  };

  // Fetch drugs when the component mounts
  useEffect(() => {
    fetchDrugs();
  }, []);

  return (
    <div>
      <h1>Drug Submission</h1>
      <DrugForm onDrugSubmit={fetchDrugs} /> {/* Pass fetchDrugs as a prop */}
      <DrugList drugs={drugs} />
      <Inventory />
     
    </div>
  );
};

export default DrugPage;