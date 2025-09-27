// src/components/Board3D.jsx - VERSIÓN COMPACTA
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
  const markedCardsRef = useRef(markedCards);

  boardRef.current = board;
  markedCardsRef.current = markedCards;

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

      serverBoard.forEach(card => {
        audioManager.preloadCardSound(card);
      });
    };

    const handleCardDrawn = ({ card }) => {
      setCurrentCard(card);
      audioManager.playCardSound(card);
    };

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
    socket.on('noMoreCards', handleNoMoreCards);
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
    <div style={containerStyle}>
      {/* ✅ ENCABEZADO COMPACTO */}
      <div style={headerStyle}>
        <div style={playerInfoStyle}>
          <span style={playerNameStyle}>👤 {playerName}</span>
          <span style={roomIdStyle}>🚪 {roomId}</span>
        </div>

        <div style={currentCardStyle}>
          {currentCard ? `🎴 ${currentCard}` : '⏳ Esperando carta...'}
        </div>
      </div>

      {/* ✅ NOTIFICACIÓN DE GANADOR COMPACTA */}
      {winner && (
        <div style={winnerStyle(winner === playerName)}>
          {winner === playerName ? '🎉 ¡GANASTE!' : `🏆 ${winner} ganó`}
        </div>
      )}

      {/* ✅ PANEL DE CONTROL COMPACTO */}
      <div style={controlPanelStyle}>
        <div style={buttonContainerStyle}>
          <button
            onClick={handleDraw}
            disabled={winner}
            style={buttonStyle(winner ? '#ccc' : '#4CAF50')}
          >
            🎴 Cantar Carta
          </button>
          <button
            onClick={handleClaim}
            disabled={markedCards.size === 0 || winner}
            style={buttonStyle(
              winner ? '#ccc' :
                hasWinningPattern ? '#ff9800' :
                  markedCards.size === 0 ? '#ccc' : '#f44336'
            )}
          >
            {hasWinningPattern ? '🎉 ¡Lotería!' : '⚡ Reclamar'}
          </button>
        </div>

        {/* ✅ INDICADOR DE PATRÓN COMPACTO */}
        {hasWinningPattern && !winner && (
          <div style={patternIndicatorStyle}>
            ✅ Tienes un patrón ganador
          </div>
        )}
      </div>

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

      <div style={essentialInfoStyle}>
      <span>📍 Marcadas: {markedCards.size}/16</span>
      {hasWinningPattern && <span style={{color: '#4CAF50', marginLeft: '10px'}}>✅ Patrón válido</span>}
    </div>


    </div>
  );
}
const essentialInfoStyle = {
  marginTop: '15px',
  padding: '8px',
  backgroundColor: '#202020ff',
  borderRadius: '6px',
  textAlign: 'center',
  fontSize: '14px',
  fontWeight: 'bold'
};
// ✅ ESTILOS COMPACTOS
const containerStyle = {
  padding: '10px', // ✅ Menos padding general
  fontFamily: 'Arial, sans-serif',
  maxWidth: '800px',
  margin: '0 auto',
  background: 'white',
  borderRadius: '10px',
  minHeight: '100vh'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',
  padding: '10px',
  backgroundColor: 'rgba(0, 0, 0, 0.95)',
  borderRadius: '8px',
  flexWrap: 'wrap',
  gap: '10px'
};

const playerInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px'
};

const playerNameStyle = {
  fontWeight: 'bold',
  fontSize: '14px',
  color: '#ffffffff'
};

const roomIdStyle = {
  fontSize: '12px',
  color: '#ffffffff'
};

const currentCardStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#ffffffff',
  textAlign: 'center',
  flex: 1,
  minWidth: '200px'
};

const winnerStyle = (isPlayer) => ({
  backgroundColor: isPlayer ? '#4CAF50' : '#ff9800',
  color: 'white',
  padding: '10px',
  borderRadius: '6px',
  marginBottom: '15px',
  textAlign: 'center',
  fontSize: '16px',
  fontWeight: 'bold'
});

const controlPanelStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  padding: '12px',
  borderRadius: '8px',
  marginBottom: '15px',
  textAlign: 'center'
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '10px',
  flexWrap: 'wrap'
};

const buttonStyle = (backgroundColor) => ({
  padding: '8px 16px',
  backgroundColor: backgroundColor,
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  minWidth: '140px'
});

const patternIndicatorStyle = {
  color: '#4CAF50',
  fontWeight: 'bold',
  fontSize: '14px',
  marginTop: '8px'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '9px 6px', // ✅ Un poco más de espacio horizontal
  margin: '0 auto',
  maxWidth: '620px', // ✅ Aumenta ligeramente si es necesario
};