// src/components/JoinScreen.jsx
import React, { useState } from 'react';

const JoinScreen = ({ onJoin }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim() && roomId.trim()) {
      onJoin(playerName.trim(), roomId.trim(), isCreatingRoom);
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
              required
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
              required
            />
          </div>

          {/* Selector simple: Crear o Unirse */}
          <div style={roleSelectorStyle}>
            <label style={labelStyle}>Acción:</label>
            <div style={radioGroupStyle}>
              <label style={radioLabelStyle}>
                <input
                  type="radio"
                  name="action"
                  checked={isCreatingRoom}
                  onChange={() => setIsCreatingRoom(true)}
                  style={radioStyle}
                />
                <span style={radioTextStyle}>🎮 Crear Nueva Sala</span>
                <div style={roleDescriptionStyle}>
                  Serás el cantador y también podrás jugar
                </div>
              </label>
              
              <label style={radioLabelStyle}>
                <input
                  type="radio"
                  name="action"
                  checked={!isCreatingRoom}
                  onChange={() => setIsCreatingRoom(false)}
                  style={radioStyle}
                />
                <span style={radioTextStyle}>🎴 Unirse a Sala Existente</span>
                <div style={roleDescriptionStyle}>
                  Solo podrás jugar, no cantar cartas
                </div>
              </label>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={!playerName.trim() || !roomId.trim()}
            style={buttonStyle(isCreatingRoom)}
          >
            {isCreatingRoom ? '🎮 Crear y Jugar' : '🎴 Unirse a Jugar'}
          </button>
        </form>

        <div style={instructionsStyle}>
          <h3>¿Cómo jugar?</h3>
          
          <div style={instructionSectionStyle}>
            <strong>🎮 Creador de la Sala (Cantador):</strong>
            <p>• Crea la sala y comparte el nombre</p>
            <p>• Solo tú puedes cantar las cartas para todos</p>
            <p>• También juegas con tu propio tablero</p>
            <p>• Ves a todos los jugadores conectados</p>
          </div>

          <div style={instructionSectionStyle}>
            <strong>🎴 Jugadores:</strong>
            <p>• Se unen con el nombre de la sala</p>
            <p>• Juegan en sus propios tableros</p>
            <p>• No pueden cantar cartas</p>
            <p>• ¡Gritan Lotería cuando ganen!</p>
          </div>

          <div style={tipStyle}>
            💡 <strong>Tip:</strong> El primero en crear la sala será el cantador
          </div>
        </div>
      </div>
    </div>
  );
};

// Estilos (similares a los anteriores, con pequeños ajustes)
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
  transition: 'border-color 0.3s',
  '&:focus': {
    borderColor: '#4CAF50',
    outline: 'none'
  }
};

const roleSelectorStyle = {
  textAlign: 'left',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '2px solid #e9ecef'
};

const radioGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  marginTop: '10px'
};

const radioLabelStyle = {
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  padding: '10px',
  borderRadius: '6px',
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: '#e9ecef'
  }
};

const radioStyle = {
  marginRight: '10px'
};

const radioTextStyle = {
  fontWeight: 'bold',
  fontSize: '16px',
  color: '#333'
};

const roleDescriptionStyle = {
  fontSize: '12px',
  color: '#666',
  marginTop: '5px',
  marginLeft: '25px'
};

const buttonStyle = (isCreatingRoom) => ({
  padding: '15px',
  backgroundColor: isCreatingRoom ? '#2196F3' : '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
  '&:hover:not(:disabled)': {
    backgroundColor: isCreatingRoom ? '#1976D2' : '#45a049'
  },
  '&:disabled': {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  }
});

const instructionsStyle = {
  marginTop: '30px',
  padding: '20px',
  backgroundColor: '#f0f0f0',
  borderRadius: '10px',
  textAlign: 'left',
  fontSize: '14px'
};

const instructionSectionStyle = {
  marginBottom: '15px',
  paddingBottom: '15px',
  borderBottom: '1px solid #ddd'
};

const tipStyle = {
  padding: '10px',
  backgroundColor: '#e3f2fd',
  borderRadius: '6px',
  borderLeft: '4px solid #2196F3',
  fontSize: '13px'
};

export default JoinScreen;