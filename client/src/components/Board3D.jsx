// src/components/Board3D.jsx - VERSIÓN OPTIMIZADA
import React, { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import Card3D from './Card3D';
import JoinScreen from './JoinScreen';
import { audioManager } from '../utils/AudioManager';
import { checkWin, generateEmptyDrawn } from '../utils/game';
import { getCardInfo } from '../utils/loteriaNumbers';

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

  const handleJoin = useCallback((name, room) => {
    setPlayerName(name);
    setRoomId(room);
    setGameStarted(true);
  }, []);

  const generateWinPatterns = useCallback((rows, cols) => {
    const patterns = [];
    
    // Filas
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) row.push(r * cols + c);
      patterns.push(row);
    }
    
    // Columnas
    for (let c = 0; c < cols; c++) {
      const col = [];
      for (let r = 0; r < rows; r++) col.push(r * cols + c);
      patterns.push(col);
    }
    
    // Diagonales (solo si es cuadrada)
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
  }, []);

  const preloadCommonCardSounds = useCallback(() => {
    const commonCards = [
      'The Hummingbird', 'The Little Devil', 'The Lady', 'The Catrin', 'The Umbrella',
      'The Avocado', 'The Ladder', 'The Bottle', 'The Barrel', 'The Tree',
      'The Melon', 'The Otter', 'The Coin', 'The Arduino', 'The Pear',
      'The Flag', 'The Big Mandolin', 'The Cello', 'The Panther', 'The Hen',
      'The Hand', 'The Boot', 'The Moon', 'The LED', 'The Witch',
      'The Black Man', 'The Heart', 'The Watermelon', 'The Drum', 'The Shrimp',
      'The Arrows', 'The Headphones', 'The Spider', 'The Soldier', 'The Star',
      'The Saucepan', 'The World', 'The Apache', 'The Nopal', 'The Snake',
      'The Rose', 'The Skull', 'The Bell', 'The Michelada', 'The Deer',
      'The Sun', 'The Crown', 'The Chalupa', 'The Pine Tree', 'The Fish',
      'The Tamal', 'The Flowerpot', 'The Talachas', 'The Frog'
    ];
    
    commonCards.forEach(card => {
      audioManager.preloadCardSound(card);
    });
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

    socket.emit('joinRoom', { roomId, playerName });
    preloadCommonCardSounds();

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
  }, [gameStarted, roomId, playerName, generateWinPatterns, preloadCommonCardSounds]);

  const handleDraw = () => {
    socket.emit('drawCard', { roomId });
  };

  const handleClaim = () => {
    socket.emit('claimWin', { roomId, markedCards: Array.from(markedCardsRef.current) });
  };

  const toggleCard = useCallback((card) => {
    if (winner) return;
    
    setMarkedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(card)) {
        newSet.delete(card);
      } else {
        newSet.add(card);
      }
      return newSet;
    });
  }, [winner]);

  const hasWinningPattern = checkWin(board, markedCards, patterns);

  if (!gameStarted) {
    return <JoinScreen onJoin={handleJoin} />;
  }

  return (
    <div style={containerStyle}>
      {/* ENCABEZADO */}
      <div style={headerStyle}>
        <div style={playerInfoStyle}>
          <span style={playerNameStyle}>👤 {playerName}</span>
          <span style={roomIdStyle}>🚪 {roomId}</span>
        </div>

        <div style={currentCardStyle}>
          {currentCard ? (
            <div style={currentCardContentStyle}>
              <div style={currentCardMainStyle}>
                🎴 {getCardInfo(currentCard).phonetic}
              </div>
            </div>
          ) : (
            '⏳ Esperando carta...'
          )}
        </div>
      </div>

      {/* NOTIFICACIÓN DE GANADOR */}
      {winner && (
        <div style={winnerStyle(winner === playerName)}>
          {winner === playerName ? '🎉 ¡GANASTE!' : `🏆 ${winner} ganó`}
        </div>
      )}

      {/* PANEL DE CONTROL */}
      <div style={controlPanelStyle}>
        <div style={buttonContainerStyle}>
          <button
            onClick={handleDraw}
            disabled={!!winner}
            style={buttonStyle(winner ? '#ccc' : '#4CAF50')}
          >
            🎴 Cantar Carta
          </button>
          <button
            onClick={handleClaim}
            disabled={markedCards.size === 0 || !!winner}
            style={buttonStyle(
              winner ? '#ccc' :
                hasWinningPattern ? '#ff9800' :
                  markedCards.size === 0 ? '#ccc' : '#f44336'
            )}
          >
            {hasWinningPattern ? '🎉 ¡Lotería!' : '⚡ Reclamar'}
          </button>
        </div>

        {/* INDICADOR DE PATRÓN */}
        {hasWinningPattern && !winner && (
          <div style={patternIndicatorStyle}>
            ✅ Tienes un patrón ganador
          </div>
        )}
      </div>

      {/* TABLERO DE CARTAS */}
      <div style={gridStyle}>
        {board.map((card, idx) => (
          <Card3D
            key={`${card}-${idx}`}
            card={card}
            selected={markedCards.has(card)}
            onClick={() => toggleCard(card)}
            isCurrent={currentCard === card}
          />
        ))}
      </div>

      {/* INFORMACIÓN ESENCIAL */}
      <div style={essentialInfoStyle}>
        <span>📍 Marcadas: {markedCards.size}/16</span>
        {hasWinningPattern && <span style={{ color: '#4CAF50', marginLeft: '10px' }}>✅ Patrón válido</span>}
      </div>
    </div>
  );
}

// Estilos (mantener igual)
const containerStyle = {
  padding: '10px',
  fontFamily: 'Arial, sans-serif',
  maxWidth: '800px',
  margin: '0 auto',
  background: '#ffffff49',
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

const currentCardContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px'
};

const currentCardMainStyle = {
  fontSize: '16px',
  fontWeight: 'bold'
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
  gap: '9px 25px',
  margin: '0 auto',
  maxWidth: '620px'
};

const essentialInfoStyle = {
  marginTop: '15px',
  padding: '8px',
  backgroundColor: '#fdfdfdff',
  borderRadius: '6px',
  textAlign: 'center',
  fontSize: '14px',
  fontWeight: 'bold'
};