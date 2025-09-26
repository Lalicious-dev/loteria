// src/components/JoinScreen.jsx
import React, { useState } from 'react';

const JoinScreen = ({ onJoin }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim() && roomId.trim()) {
      onJoin(playerName.trim(), roomId.trim());
    }
  };

  return (
    <div style={joinScreenStyle}>
      <div style={formContainerStyle}>
        <h1 style={titleStyle}>🎯 Lotería Mexicana 3D</h1>
        
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Tu Nombre:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ej: Juan"
              style={inputStyle}
              maxLength={20}
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Sala:</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Ej: familia-navidad"
              style={inputStyle}
              maxLength={30}
            />
          </div>
          
          <button 
            type="submit"
            disabled={!playerName.trim() || !roomId.trim()}
            style={buttonStyle}
          >
            🎴 Unirse a la Partida
          </button>
        </form>

        <div style={instructionsStyle}>
          <h3>¿Cómo jugar?</h3>
          <p>1. Ingresa tu nombre y elige una sala</p>
          <p>2. Comparte el nombre de la sala con tus amigos</p>
          <p>3. ¡El primero en completar un patrón gana!</p>
        </div>
      </div>
    </div>
  );
};

// Estilos
const joinScreenStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#2d5016',
  backgroundImage: 'linear-gradient(135deg, #2d5016 0%, #4a7c2a 100%)',
  fontFamily: 'Arial, sans-serif'
};

const formContainerStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  padding: '40px',
  borderRadius: '20px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  textAlign: 'center',
  maxWidth: '500px',
  width: '90%'
};

const titleStyle = {
  color: '#2d5016',
  marginBottom: '30px',
  fontSize: '2.5em'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left'
};

const labelStyle = {
  fontWeight: 'bold',
  marginBottom: '8px',
  color: '#333'
};

const inputStyle = {
  padding: '12px',
  border: '2px solid #ddd',
  borderRadius: '8px',
  fontSize: '16px',
  transition: 'border-color 0.3s'
};

const buttonStyle = {
  padding: '15px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background-color 0.3s'
};

const instructionsStyle = {
  marginTop: '30px',
  padding: '20px',
  backgroundColor: '#f0f0f0',
  borderRadius: '10px',
  textAlign: 'left'
};

export default JoinScreen;