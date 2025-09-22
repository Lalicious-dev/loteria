// client/src/App.jsx
import React, { useState } from 'react';
import Board from './components/Board';

function App() {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    if (!playerName || !roomId) return alert('Ingresa nombre y sala');
    setJoined(true);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      {!joined ? (
        <div>
          <h1>Lotería Mexicana</h1>
          <input placeholder="Nombre" value={playerName} onChange={e => setPlayerName(e.target.value)} />
          <input placeholder="Sala" value={roomId} onChange={e => setRoomId(e.target.value)} />
          <button onClick={handleJoin}>Entrar</button>
        </div>
      ) : (
        <Board playerName={playerName} roomId={roomId} />
      )}
    </div>
  );
}

export default App;
