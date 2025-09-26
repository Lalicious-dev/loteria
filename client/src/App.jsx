// src/App.js
import React from 'react';
import Board3D from './components/Board3D';
import './App.css';

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const playerName = urlParams.get('player') || 'Jugador';
  const roomId = urlParams.get('room') || 'sala-general';

  return (
    <div className="App">
      <Board3D playerName={playerName} roomId={roomId} />
    </div>
  );
}

export default App;