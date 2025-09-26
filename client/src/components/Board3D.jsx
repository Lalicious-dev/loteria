// src/components/Board3D.jsx - CORREGIDO
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import Card3D from './Card3D';
import JoinScreen from './JoinScreen';
import { audioManager } from '../utils/AudioManager';
import { checkWin, generateEmptyDrawn } from '../utils/game';

const socket = io('http://localhost:3000');

export default function Board3D() {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [board, setBoard] = useState([]);
  const [markedCards, setMarkedCards] = useState(generateEmptyDrawn());
  const [currentCard, setCurrentCard] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const boardRef = useRef(board);
  const markedCardsRef = useRef(markedCards); // ✅ AGREGAR ESTA LÍNEA
  
  boardRef.current = board;
  markedCardsRef.current = markedCards; // ✅ AGREGAR ESTA LÍNEA

  // Función para unirse al juego
  const handleJoin = (name, room) => {
    setPlayerName(name);
    setRoomId(room);
    setGameStarted(true);
  };

  useEffect(() => {
    if (!gameStarted) return;

    socket.emit('joinRoom', { roomId, playerName });

    const handleBoard = ({ board: serverBoard, rows, cols }) => {
      setBoard(serverBoard);
      setMarkedCards(generateEmptyDrawn());
      setCurrentCard(null);
      setWinner(null);

      const winPatterns = generateWinPatterns(rows, cols);
      setPatterns(winPatterns);

      // Precargar sonidos
      serverBoard.forEach(card => {
        audioManager.preloadCardSound(card);
      });
    };

    const handleCardDrawn = ({ card }) => {
      setCurrentCard(card);
      audioManager.playCardSound(card);
    };

    // ✅ AGREGAR handleNoMoreCards QUE FALTABA
    const handleNoMoreCards = () => {
      alert('¡Se terminaron las cartas!');
    };

    const handleSomeoneWon = ({ player, winningCards }) => {
      setWinner(player);
      audioManager.playVictory();
      setMarkedCards(generateEmptyDrawn());
      setCurrentCard(null);
    };

    const handleClaimResult = (result) => {
      if (result.win) {
        audioManager.playVictory();
        setWinner(playerName);
        setMarkedCards(generateEmptyDrawn());
        setCurrentCard(null);
      } else {
        alert(result.error || '❌ No tienes un patrón ganador válido.');
      }
    };

    socket.on('board', handleBoard);
    socket.on('cardDrawn', handleCardDrawn);
    socket.on('noMoreCards', handleNoMoreCards); // ✅ AHORA SÍ EXISTE
    socket.on('someoneWon', handleSomeoneWon);
    socket.on('claimResult', handleClaimResult);

    return () => {
      socket.off('board', handleBoard);
      socket.off('cardDrawn', handleCardDrawn);
      socket.off('noMoreCards', handleNoMoreCards);
      socket.off('someoneWon', handleSomeoneWon);
      socket.off('claimResult', handleClaimResult);
    };
  }, [gameStarted, roomId, playerName]);

  const generateWinPatterns = (rows, cols) => {
    const patterns = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) row.push(r * cols + c);
      patterns.push(row);
    }
    for (let c = 0; c < cols; c++) {
      const col = [];
      for (let r = 0; r < rows; r++) col.push(r * cols + c);
      patterns.push(col);
    }
    if (rows === cols) {
      const diag1 = [];
      const diag2 = [];
      for (let i = 0; i < rows; i++) {
        diag1.push(i * cols + i);
        diag2.push(i * cols + (cols - 1 - i));
      }
      patterns.push(diag1, diag2);
    }
    return patterns;
  };

  const handleDraw = () => {
    socket.emit('drawCard', { roomId });
  };

  const handleClaim = () => {
    // ✅ CORREGIDO: usar markedCardsRef.current que ahora sí existe
    socket.emit('claimWin', { roomId, markedCards: Array.from(markedCardsRef.current) });
  };

  const toggleCard = (card) => {
    setMarkedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(card)) {
        newSet.delete(card);
      } else {
        newSet.add(card);
      }
      return newSet;
    });
  };

  const hasWinningPattern = checkWin(board, markedCards, patterns);

  if (!gameStarted) {
    return <JoinScreen onJoin={handleJoin} />;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Jugador: {playerName}</h2>
      <h3>Sala: {roomId}</h3>

      {winner && (
        <div style={winnerStyle(winner === playerName)}>
          {winner === playerName ? '🎉 ¡ERES EL GANADOR! 🎉' : `🎉 ${winner} GANÓ LA PARTIDA 🎉`}
        </div>
      )}

      <div style={controlPanelStyle}>
        <h3 style={{ color: currentCard ? '#4CAF50' : '#666' }}>
          {currentCard ? `Carta cantada: "${currentCard}"` : 'Presiona "Cantar Carta"'}
        </h3>

        <div style={buttonContainerStyle}>
          <button onClick={handleDraw} disabled={winner} style={buttonStyle(winner ? '#ccc' : '#4CAF50')}>
            Cantar Carta
          </button>
          <button onClick={handleClaim} disabled={markedCards.size === 0 || winner} 
            style={buttonStyle(
              winner ? '#ccc' : 
              hasWinningPattern ? '#ff9800' : 
              markedCards.size === 0 ? '#ccc' : '#f44336'
            )}>
            {hasWinningPattern ? '🎉 ¡Gritar loteria!' : 'Reclamar Victoria'}
          </button>
        </div>

        {hasWinningPattern && !winner && (
          <p style={{ color: '#4CAF50', fontWeight: 'bold', marginTop: '10px' }}>
            ✅ ¡Tienes un patrón ganador! Puedes reclamar victoria
          </p>
        )}
      </div>

      {/* Grid de cartas 3D */}
      <div style={gridStyle}>
        {board.map((card, idx) => (
          <Card3D
            key={idx}
            card={card}
            selected={markedCards.has(card)}
            onClick={() => !winner && toggleCard(card)}
            isCurrent={currentCard === card}
          />
        ))}
      </div>

      {/* Información adicional */}
      <div style={instructionsStyle}>
        <h4>🎯 Instrucciones:</h4>
        <p>1. Presiona "Cantar Carta" para revelar una carta</p>
        <p>2. Marca las casillas que coincidan con las cartas cantadas</p>
        <p>3. Cuando completes un patrón, presiona "¡Gritar loteria!"</p>
      </div>
      
      <div style={statsStyle}>
        <p>📍 <strong>Cartas marcadas:</strong> {markedCards.size} / 16</p>
        <p>🎯 <strong>Patrón válido:</strong> {hasWinningPattern ? '✅ Sí' : '❌ No'}</p>
        {winner && <p>🏆 <strong>Ganador:</strong> {winner}</p>}
      </div>
    </div>
  );
}

// Estilos
const winnerStyle = (isPlayer) => ({
  backgroundColor: isPlayer ? '#4CAF50' : '#ff9800',
  color: 'white',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '20px',
  textAlign: 'center',
  fontSize: '18px'
});

const controlPanelStyle = {
  backgroundColor: '#f0f0f0',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '20px',
  textAlign: 'center'
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '10px',
  marginTop: '10px'
};

const buttonStyle = (backgroundColor) => ({
  padding: '10px 20px',
  backgroundColor: backgroundColor,
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px'
});

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '15px',
  margin: '20px auto',
  maxWidth: '600px'
};

const instructionsStyle = {
  marginTop: '20px',
  padding: '10px',
  backgroundColor: '#e3f2fd',
  borderRadius: '4px'
};

const statsStyle = {
  marginTop: '15px',
  padding: '10px',
  backgroundColor: '#e8f5e8',
  borderRadius: '4px',
  textAlign: 'center'
};