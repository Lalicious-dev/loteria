import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import Card from './Card';
import { checkWin, generateEmptyDrawn } from '../utils/game';

const socket = io('http://localhost:3000');

export default function Board({ playerName, roomId }) {
  const [board, setBoard] = useState([]);
  const [markedCards, setMarkedCards] = useState(generateEmptyDrawn());
  const [currentCard, setCurrentCard] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [winner, setWinner] = useState(null); // Para mostrar el ganador

  const boardRef = useRef(board);
  const markedCardsRef = useRef(markedCards);
  const patternsRef = useRef(patterns);

  boardRef.current = board;
  markedCardsRef.current = markedCards;
  patternsRef.current = patterns;

  useEffect(() => {
    socket.emit('joinRoom', { roomId, playerName });

    const handleBoard = ({ board: serverBoard, rows, cols }) => {
      setBoard(serverBoard);
      setMarkedCards(generateEmptyDrawn());
      setCurrentCard(null);
      setWinner(null); // Reiniciar ganador al empezar nuevo juego
      
      const winPatterns = generateWinPatterns(rows, cols);
      setPatterns(winPatterns);
    };

    const handleCardDrawn = ({ card }) => {
      setCurrentCard(card);
    };

    const handleNoMoreCards = () => {
      alert('¡Se terminaron las cartas!');
    };
    
    const handleSomeoneWon = ({ player, winningCards }) => {
      // ✅ ESTE ES EL MENSAJE QUE LLEGA A TODOS LOS JUGADORES
      setWinner(player);
      alert(`🎉 ${player} ganó la partida! 🎉\nPatrón ganador: ${winningCards.join(', ')}`);
      
      // Reiniciar el tablero después de que alguien gane
      setMarkedCards(generateEmptyDrawn());
      setCurrentCard(null);
    };

    const handleClaimResult = (result) => {
      if (result.win) {
        const winningCards = result.pattern.map(i => boardRef.current[i]);
        alert(`🎉 ¡Felicidades! Ganaste 🎉\nPatrón ganador: ${winningCards.join(', ')}`);
        setMarkedCards(generateEmptyDrawn());
        setCurrentCard(null);
        setWinner(playerName); // Tú eres el ganador
      } else {
        alert('❌ Reclamo incorrecto. No tienes un patrón ganador válido.');
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

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Jugador: {playerName}</h2>
      <h3>Sala: {roomId}</h3>
      
      {/* ✅ MOSTRAR GANADOR ACTUAL */}
      {winner && (
        <div style={{
          backgroundColor: winner === playerName ? '#4CAF50' : '#ff9800',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '18px'
        }}>
          {winner === playerName ? '🎉 ¡ERES EL GANADOR! 🎉' : `🎉 ${winner} GANÓ LA PARTIDA 🎉`}
        </div>
      )}
      
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: currentCard ? '#4CAF50' : '#666' }}>
          {currentCard ? `Carta cantada: "${currentCard}"` : 'Presiona "Cantar Carta"'}
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
          <button 
            onClick={handleDraw}
            disabled={winner} // Deshabilitar si ya hay ganador
            style={{
              padding: '10px 20px',
              backgroundColor: winner ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: winner ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            Cantar Carta
          </button>
          
          <button 
            onClick={handleClaim} 
            disabled={markedCards.size === 0 || winner}
            style={{
              padding: '10px 20px',
              backgroundColor: winner ? '#ccc' : (hasWinningPattern ? '#ff9800' : (markedCards.size === 0 ? '#ccc' : '#f44336')),
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (markedCards.size === 0 || winner) ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {hasWinningPattern ? '🎉 ¡Grité Lotería!' : 'Reclamar Victoria'}
          </button>
        </div>

        {hasWinningPattern && !winner && (
          <p style={{ color: '#4CAF50', fontWeight: 'bold', marginTop: '10px' }}>
            ✅ ¡Tienes un patrón ganador! Puedes reclamar victoria
          </p>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '15px', 
        margin: '20px auto',
        maxWidth: '600px'
      }}>
        {board.map((card, idx) => (
          <Card 
            key={idx} 
            card={card} 
            selected={markedCards.has(card)} 
            onClick={() => !winner && toggleCard(card)} // No clickeable si hay ganador
            isCurrent={currentCard === card}
          />
        ))}
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '10px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px'
      }}>
        <h4>🎯 Instrucciones:</h4>
        <p>1. Presiona "Cantar Carta" para revelar una carta</p>
        <p>2. <strong>MARCA LIBREMENTE</strong> las casillas que quieras</p>
        <p>3. Cuando creas tener un patrón completo, presiona "Reclamar Victoria"</p>
        <p>4. <strong>El sistema validará automáticamente</strong> si ganaste</p>
        <p>5. <strong>¡Todos serán notificados cuando alguien gane!</strong></p>
      </div>
      
      <div style={{ 
        marginTop: '15px', 
        padding: '10px',
        backgroundColor: '#e8f5e8',
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        <p>📍 <strong>Cartas marcadas:</strong> {markedCards.size} / 16</p>
        <p>🎯 <strong>Patrón válido:</strong> {hasWinningPattern ? '✅ Sí' : '❌ No'}</p>
        {winner && <p>🏆 <strong>Ganador:</strong> {winner}</p>}
      </div>
    </div>
  );
}