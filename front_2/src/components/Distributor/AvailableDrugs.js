import React from "react";

const AvailableDrugs = ({ availableDrugs, loading, error, onAddToBasket }) => {
  return (
    <div className="available-drugs-container">
      <h2>Available Drugs</h2>
      
      {loading && <p>Loading...</p>}
      {error && <div className="error-message">{error}</div>}

      {availableDrugs.length === 0 && !loading ? (
        <p>No available drugs found</p>
      ) : (
        <table className="table-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>PCT Code</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {availableDrugs.map((drug) => (
              <tr key={drug._id}>
                <td>{drug.name}</td>
                <td>{drug.price}</td>
                <td>{drug.quantity}</td>
                <td>{drug.pctCode}</td>
                <td>
                  <button 
                    onClick={() => onAddToBasket(drug)}
                    className="add-to-basket-button"
                  >
                    Add to Basket
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AvailableDrugs;