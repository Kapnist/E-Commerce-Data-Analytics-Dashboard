import React from 'react';

const MapChart = ({ etatSelectionne }) => {
  return (
    <div style={{ 
      backgroundColor: 'white', padding: '20px', borderRadius: '15px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' 
    }}>
      <h3 style={{ color: '#5a5c69', marginBottom: '15px' }}>Région Focus</h3>
      <div style={{ 
        height: '150px', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', backgroundColor: '#f8f9fc', borderRadius: '10px',
        border: '2px dashed #4e73df'
      }}>
        <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#4e73df' }}>
          {etatSelectionne}
        </div>
      </div>
      <p style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
        Données filtrées pour le code État : <strong>{etatSelectionne}</strong>
      </p>
    </div>
  );
};

export default MapChart;
