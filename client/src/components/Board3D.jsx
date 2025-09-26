// src/components/Board3D.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import io from 'socket.io-client';
import Card3D from './Card3D';
import Maiz3D from './Maiz3D';
import { audioManager } from '../utils/AudioManager';
import { checkWin, generateEmptyDrawn } from '../utils/game';

const socket = io('http://localhost:3000');

const Board3D = ({ playerName, roomId }) => {
  const [board, setBoard] = useState([]);
  const [markedCards, setMarkedCards] = useState(generateEmptyDrawn());
  const [currentCard, setCurrentCard] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [winner, setWinner] = useState(null);
  const [muted, setMuted] = useState(false);

  const boardRef = useRef(board);
  boardRef.current = board;

  useEffect(() => {
    socket.emit('joinRoom', { roomId, playerName });

    const handleBoard = ({ board: serverBoard, rows, cols }) => {
      setBoard(serverBoard);
      setMarkedCards(generateEmptyDrawn());
      setCurrentCard(null);
      setWinner(null);
      
      const winPatterns = generateWinPatterns(rows, cols);
      setPatterns(winPatterns);

      // Precargar sonidos para las cartas del tablero
      serverBoard.forEach(card => {
        audioManager.preloadCardSound(card);
      });
    };

    const handleCardDrawn = ({ card }) => {
      setCurrentCard(card);
      audioManager.playCardSound(card);
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
    socket.on('someoneWon', handleSomeoneWon);
    socket.on('claimResult', handleClaimResult);
    socket.on('noMoreCards', () => alert('¡Se terminaron las cartas!'));

    return () => {
      socket.off('board', handleBoard);
      socket.off('cardDrawn', handleCardDrawn);
      socket.off('someoneWon', handleSomeoneWon);
      socket.off('claimResult', handleClaimResult);
      socket.off('noMoreCards');
    };
  }, [roomId, playerName]);

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

  const getCardPosition = (index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    return [col * 2.2 - 3.3, -row * 2.5 + 3.5, 0];
  };

  const handleDraw = () => socket.emit('drawCard', { roomId });
  const handleClaim = () => socket.emit('claimWin', { roomId, markedCards: Array.from(markedCards) });

  const toggleCard = (card) => {
    if (winner) return;
    setMarkedCards(prev => {
      const newSet = new Set(prev);
      newSet.has(card) ? newSet.delete(card) : newSet.add(card);
      return newSet;
    });
  };

  const toggleMute = () => {
    const isMuted = audioManager.toggleMute();
    setMuted(isMuted);
  };

  const hasWinningPattern = checkWin(board, markedCards, patterns);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* UI Overlay */}
      <div style={uiOverlayStyle}>
        <div style={panelStyle}>
          <h2 style={{ margin: 0, color: '#333' }}>🎯 {playerName}</h2>
          <p style={{ margin: '5px 0', color: '#666' }}>Sala: {roomId}</p>
          
          <div style={cardInfoStyle}>
            <h3 style={{ margin: 0, color: currentCard ? '#4CAF50' : '#999' }}>
              {currentCard ? `📢 "${currentCard}"` : 'Esperando carta...'}
            </h3>
          </div>

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
              disabled={!markedCards.size || winner}
              style={buttonStyle(
                winner ? '#ccc' : 
                hasWinningPattern ? '#FF9800' : 
                !markedCards.size ? '#ccc' : '#F44336'
              )}
            >
              {hasWinningPattern ? '🎉 ¡Lotería!' : '⚡ Reclamar'}
            </button>

            <button 
              onClick={toggleMute}
              style={buttonStyle(muted ? '#666' : '#9C27B0')}
            >
              {muted ? '🔇 Sonido' : '🔊 Sonido'}
            </button>
          </div>

          {hasWinningPattern && !winner && (
            <p style={{ color: '#4CAF50', fontWeight: 'bold', margin: '10px 0' }}>
              ✅ ¡Tienes un patrón ganador!
            </p>
          )}
        </div>

        {/* Stats Panel */}
        <div style={statsPanelStyle}>
          <p>📍 Marcadas: <strong>{markedCards.size}/16</strong></p>
          <p>🎯 Patrón: <strong>{hasWinningPattern ? '✅ Válido' : '❌ Inválido'}</strong></p>
          {winner && <p>🏆 Ganador: <strong>{winner}</strong></p>}
        </div>
      </div>

      {/* Canvas 3D */}
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />
        
        <Environment preset="sunset" />
        <Sky sunPosition={[100, 10, 100]} />

        {/* Suelo */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#2d5016" roughness={0.8} />
        </mesh>

        {/* Cartas 3D */}
        {board.map((card, index) => (
          <Card3D
            key={index}
            card={card}
            selected={markedCards.has(card)}
            isCurrent={currentCard === card}
            onClick={() => toggleCard(card)}
            position={getCardPosition(index)}
          />
        ))}

        <OrbitControls 
          enableZoom={true} 
          enablePan={true}
          minDistance={5}
          maxDistance={20}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Notificación de ganador */}
      {winner && (
        <div style={winnerOverlayStyle}>
          <div style={winnerModalStyle}>
            <h1>🏆 {winner === playerName ? '¡ERES EL GANADOR!' : `¡${winner} GANÓ!`} 🏆</h1>
            <p>¡Felicidades por completar la lotería mexicana!</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos
const uiOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  pointerEvents: 'none'
};

const panelStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  padding: '20px',
  margin: '20px',
  borderRadius: '15px',
  backdropFilter: 'blur(10px)',
  pointerEvents: 'auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
};

const cardInfoStyle = {
  backgroundColor: 'rgba(240, 240, 240, 0.8)',
  padding: '10px',
  borderRadius: '8px',
  margin: '10px 0'
};

const buttonContainerStyle = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap'
};

const buttonStyle = (bgColor) => ({
  padding: '12px 20px',
  backgroundColor: bgColor,
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  pointerEvents: 'auto'
});

const statsPanelStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: '15px',
  margin: '20px',
  borderRadius: '10px',
  backdropFilter: 'blur(5px)',
  pointerEvents: 'auto',
  position: 'absolute',
  top: 0,
  right: 0,
  width: '200px'
};

const winnerOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const winnerModalStyle = {
  backgroundColor: 'rgba(255, 215, 0, 0.95)',
  padding: '40px',
  borderRadius: '20px',
  textAlign: 'center',
  color: '#000',
  backdropFilter: 'blur(10px)'
};

export default Board3D;