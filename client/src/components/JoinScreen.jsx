// src/components/JoinScreen.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faDoorOpen, 
  faCrown, 
  faUsers,
  faGamepad,
  faVolumeUp,
  faTrophy,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
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
        <h1 style={titleStyle}>
          <FontAwesomeIcon icon={faTrophy} style={{marginRight: '10px'}} />
          Mexican Lottery
        </h1>
        
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              <FontAwesomeIcon icon={faUser} style={{marginRight: '8px'}} />
              Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              style={inputStyle}
              maxLength={20}
              required
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              <FontAwesomeIcon icon={faDoorOpen} style={{marginRight: '8px'}} />
              Room
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Room name"
              style={inputStyle}
              maxLength={30}
              required
            />
          </div>

          {/* Selector simple: Crear o Unirse */}
          <div style={roleSelectorStyle}>
            <label style={labelStyle}>Action:</label>
            <div style={radioGroupStyle}>
              <label style={radioLabelStyle}>
                <input
                  type="radio"
                  name="action"
                  checked={isCreatingRoom}
                  onChange={() => setIsCreatingRoom(true)}
                  style={radioStyle}
                />
                <span style={radioTextStyle}>
                  <FontAwesomeIcon icon={faCrown} style={{marginRight: '8px'}} />
                  Create new room
                </span>
                <div style={roleDescriptionStyle}>
                  You will be the caller and can also play
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
                <span style={radioTextStyle}>
                  <FontAwesomeIcon icon={faUsers} style={{marginRight: '8px'}} />
                  Join existing room
                </span>
                <div style={roleDescriptionStyle}>
                  You can only play, not call cards
                </div>
              </label>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={!playerName.trim() || !roomId.trim()}
            style={buttonStyle(isCreatingRoom)}
          >
            <FontAwesomeIcon icon={isCreatingRoom ? faCrown : faGamepad} style={{marginRight: '8px'}} />
            {isCreatingRoom ? 'Create & Play' : 'Join Game'}
          </button>
        </form>

        <div style={instructionsStyle}>
          <h3>
            <FontAwesomeIcon icon={faGamepad} style={{marginRight: '8px'}} />
            How to Play?
          </h3>
          
          <div style={instructionSectionStyle}>
            <strong>
              <FontAwesomeIcon icon={faCrown} style={{marginRight: '8px'}} />
              Room Creator (Caller):
            </strong>
            <p>• Create the room and share the name</p>
            <p>• Only you can call cards for everyone</p>
            <p>• You also play with your own board</p>
            <p>• You can see all connected players</p>
          </div>

          <div style={instructionSectionStyle}>
            <strong>
              <FontAwesomeIcon icon={faUsers} style={{marginRight: '8px'}} />
              Players:
            </strong>
            <p>• Join using the room name</p>
            <p>• Play on your own boards</p>
            <p>• Cannot call cards</p>
            <p>• Shout "Lottery!" when you win!</p>
          </div>

          <div style={tipStyle}>
            <FontAwesomeIcon icon={faLightbulb} style={{marginRight: '8px'}} />
            <strong>Tip:</strong> The first to create the room becomes the caller
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles with black and pink color scheme
const joinScreenStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: 'transparent',
};

const formContainerStyle = {
  background: 'linear-gradient(135deg, #ff1493 0%, #000000 100%)',
  padding: '40px',
  borderRadius: '20px',
  boxShadow: '0 10px 40px rgba(255, 20, 147, 0.5)',
  textAlign: 'center',
  maxWidth: '500px',
  width: '90%',
  border: '2px solid #ff1493'
};

const titleStyle = {
  color: '#ffffff',
  marginBottom: '30px',
  fontSize: '2.5em',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
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
  color: '#ffffff'
};

const inputStyle = {
  padding: '12px',
  background: '#000000',
  borderRadius: '8px',
  fontSize: '16px',
  border: '2px solid #ff1493',
  color: '#ffffff',
  boxShadow: '0 4px 8px rgba(255, 20, 147, 0.3)',
  transition: 'all 0.3s',
  '&:focus': {
    outline: 'none',
    borderColor: '#ff69b4',
    boxShadow: '0 4px 12px rgba(255, 20, 147, 0.5)'
  }
};

const roleSelectorStyle = {
  textAlign: 'left',
  padding: '15px',
  borderRadius: '8px',
  background: '#000000',
  color: '#ffffff',
  boxShadow: '0 4px 8px rgba(255, 20, 147, 0.3)',
  border: '1px solid #ff1493'
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
    backgroundColor: 'rgba(255, 20, 147, 0.2)'
  }
};

const radioStyle = {
  marginRight: '10px',
  accentColor: '#ff1493'
};

const radioTextStyle = {
  fontWeight: 'bold',
  fontSize: '16px',
  color: '#ffffff'
};

const roleDescriptionStyle = {
  fontSize: '12px',
  color: '#ff69b4',
  marginTop: '5px',
  marginLeft: '25px'
};

const buttonStyle = (isCreatingRoom) => ({
  padding: '15px',
  background: isCreatingRoom 
    ? 'linear-gradient(135deg, #ff1493 0%, #000000 100%)' 
    : 'linear-gradient(135deg, #ff69b4 0%, #2a2a2a 100%)',
  boxShadow: '0 4px 8px rgba(255, 20, 147, 0.4)',
  color: '#ffffff',
  border: '2px solid #ff1493',
  borderRadius: '8px',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
  '&:hover:not(:disabled)': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(255, 20, 147, 0.6)'
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #666 0%, #333 100%)',
    borderColor: '#666',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none'
  }
});

const instructionsStyle = {
  marginTop: '30px',
  padding: '20px',
  backgroundColor: '#000000ff',
  borderRadius: '10px',
  textAlign: 'left',
  fontSize: '14px',
  border: '1px solid #ff1493',
  color: '#ffffff'
};

const instructionSectionStyle = {
  marginBottom: '15px',
  paddingBottom: '15px',
  borderBottom: '1px solid #ff1493'
};

const tipStyle = {
  padding: '10px',
  backgroundColor: 'rgba(255, 20, 147, 0.2)',
  borderRadius: '6px',
  borderLeft: '4px solid #ff1493',
  fontSize: '13px',
  color: '#ffffff'
};

export default JoinScreen;