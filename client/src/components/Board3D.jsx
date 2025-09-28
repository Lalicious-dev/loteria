// src/components/Board3D.jsx - VERSIÓN CORREGIDA
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
  const [isCantador, setIsCantador] = useState(false);
  const [board, setBoard] = useState([]);
  const [markedCards, setMarkedCards] = useState(generateEmptyDrawn());
  const [currentCard, setCurrentCard] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);

  const boardRef = useRef(board);
  const markedCardsRef = useRef(markedCards);

  boardRef.current = board;
  markedCardsRef.current = markedCards;

  const handleJoin = useCallback((name, room, isCreatingRoom) => {
    setPlayerName(name);
    setRoomId(room);
    setIsCantador(isCreatingRoom);
    setGameStarted(true);
  }, []);

  const generateWinPatterns = useCallback((rows, cols) => {
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
  }, []);

  const preloadAllCardSounds = useCallback(() => {
    const allCards = [
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

    console.log('🔊 Precargando sonidos para', allCards.length, 'cartas...');

    allCards.forEach(card => {
      audioManager.preloadCardSound(card);
    });

    audioManager.preloadCardSound('victory');
    audioManager.preloadCardSound('error');
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

    // EMITIR evento de unión al servidor (no escucharlo aquí)
    socket.emit('joinRoom', { roomId, playerName, isCantador });

    // PRECARGAR TODOS LOS SONIDOS AL INICIAR
    preloadAllCardSounds();

    const handleBoard = ({ board: serverBoard, rows, cols }) => {
      console.log('🃏 Tablero recibido:', serverBoard);
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
      console.log('🎴 Carta cantada:', card);
      setCurrentCard(card);
      audioManager.playCardSound(card);
    };

    const handleNoMoreCards = () => {
      alert('¡Se terminaron las cartas!');
      audioManager.playCardSound('error');
    };

    const handleSomeoneWon = ({ player }) => {
      console.log('🏆 Ganador:', player);
      setWinner(player);
      audioManager.playVictory();
      setMarkedCards(generateEmptyDrawn());
      setCurrentCard(null);
    };

    const handleClaimResult = (result) => {
      if (result.win) {
        audioManager.playVictory();
        setWinner(playerName);
      } else {
        alert(result.error || '❌ No tienes un patrón ganador válido.');
        audioManager.playError();
      }
      setMarkedCards(generateEmptyDrawn());
      setCurrentCard(null);
    };

    const handlePlayersUpdate = ({ players: connectedPlayers }) => {
      console.log('👥 Jugadores actualizados:', connectedPlayers);
      setPlayers(connectedPlayers);
    };
    const handleCantadorUpdate = ({ cantador }) => {
      console.log('🎤 Cantador actualizado:', cantador);
      setIsCantador(cantador === playerName);
    };

    // SOLO ESCUCHAR eventos del servidor (no emitir joinRoom aquí)
    socket.on('board', handleBoard);
    socket.on('cardDrawn', handleCardDrawn);
    socket.on('noMoreCards', handleNoMoreCards);
    socket.on('someoneWon', handleSomeoneWon);
    socket.on('claimResult', handleClaimResult);
    socket.on('playersUpdate', handlePlayersUpdate);
    socket.on('cantadorUpdate', handleCantadorUpdate);

    return () => {
      // Limpiar event listeners
      socket.off('board', handleBoard);
      socket.off('cardDrawn', handleCardDrawn);
      socket.off('noMoreCards', handleNoMoreCards);
      socket.off('someoneWon', handleSomeoneWon);
      socket.off('claimResult', handleClaimResult);
      socket.off('playersUpdate', handlePlayersUpdate);
      socket.off('cantadorUpdate', handleCantadorUpdate);
    };
  }, [gameStarted, roomId, playerName, isCantador, generateWinPatterns, preloadAllCardSounds]);

  const handleDraw = () => {
    if (!isCantador) return;
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
          <div style={playerBadgeStyle}>
            <span style={playerNameStyle}>
              {isCantador ? '🎤' : '🎴'} {playerName}
            </span>
            <span style={roleBadgeStyle(isCantador)}>
              {isCantador ? 'Cantador' : 'Jugador'}
            </span>
          </div>
          <span style={roomIdStyle}>🚪 Sala: {roomId}</span>

          {/* MOSTRAR CANTIDAD DE JUGADORES CONECTADOS */}
          <div style={playersInfoStyle}>
            <span style={playersCountStyle}>
              👥 {players.length} jugador{players.length !== 1 ? 'es' : ''} conectado{players.length !== 1 ? 's' : ''}
            </span>
            {players.length > 0 && (
              <span style={playersListPreviewStyle}>
                {players.slice(0, 3).join(', ')}
                {players.length > 3 && ` y ${players.length - 3} más...`}
              </span>
            )}
          </div>
        </div>

        <div style={currentCardStyle}>
          {currentCard ? (
            <div style={currentCardContentStyle}>
              <div style={currentCardMainStyle}>
                🎴 {getCardInfo(currentCard).phonetic}
              </div>
              <div style={cardNameStyle}>{currentCard}</div>
            </div>
          ) : (
            <div style={waitingStyle}>
              {isCantador ? '🎤 Listo para cantar' : '⏳ Esperando al cantador'}
            </div>
          )}
        </div>
      </div>

      {/* LISTA DE JUGADORES (SOLO PARA CANTADOR) */}
      {isCantador && players.length > 0 && (
        <div style={playersPanelStyle}>
          <div style={playersTitleStyle}>
            👥 Jugadores en la sala ({players.length})
          </div>
          <div style={playersListStyle}>
            {players.map((player, index) => (
              <div key={index} style={playerItemStyle(player === playerName)}>
                <span style={playerIconStyle}>
                  {player === playerName ? '👑' : '🎴'}
                </span>
                {player} {player === playerName && '(Tú - Cantador)'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NOTIFICACIÓN DE GANADOR */}
      {winner && (
        <div style={winnerStyle(winner === playerName)}>
          {winner === playerName ? '🎉 ¡GANASTE!' : `🏆 ${winner} ganó`}
        </div>
      )}

      {/* PANEL DE CONTROL */}
      <div style={controlPanelStyle}>
        {isCantador ? (
          <div style={cantadorPanelStyle}>
            <div style={buttonContainerStyle}>
              <button
                onClick={handleDraw}
                disabled={!!winner}
                style={cantarButtonStyle}
              >
                🎤 Cantar Carta
              </button>
              <button
                onClick={handleClaim}
                disabled={markedCards.size === 0 || !!winner}
                style={reclamarButtonStyle(hasWinningPattern)}
              >
                {hasWinningPattern ? '🎉 ¡Lotería!' : '⚡ Reclamar'}
              </button>
            </div>
          </div>
        ) : (
          <div style={jugadorPanelStyle}>
            <button
              onClick={handleClaim}
              disabled={markedCards.size === 0 || !!winner}
              style={reclamarButtonStyle(hasWinningPattern)}
            >
              {hasWinningPattern ? '🎉 ¡Lotería!' : '⚡ Reclamar Victoria'}
            </button>
            {hasWinningPattern && !winner && (
              <div style={patternIndicatorStyle}>
                ✅ Tienes un patrón ganador
              </div>
            )}
          </div>
        )}
      </div>

      {/* TABLERO DE CARTAS */}
      <div style={gridStyle}>
        {board.length > 0 ? (
          board.map((card, idx) => (
            <Card3D
              key={`${card}-${idx}`}
              card={card}
              selected={markedCards.has(card)}
              onClick={() => toggleCard(card)}
              isCurrent={currentCard === card}
            />
          ))
        ) : (
          <div style={loadingStyle}>
            ⏳ Cargando tablero...
          </div>
        )}
      </div>

      {/* INFORMACIÓN DE JUEGO */}
      <div style={gameInfoStyle}>
        <span>📍 Marcadas: {markedCards.size}/16</span>
        {hasWinningPattern && <span style={validPatternStyle}>✅ Patrón válido</span>}
      </div>
    </div>
  );
}

// Estilos (mantener igual)
const containerStyle = {
  padding: '15px',
  fontFamily: 'Arial, sans-serif',
  maxWidth: '800px',
  margin: '0 auto',
  background: '#ffffff73',
  borderRadius: '10px',
  minHeight: '100vh'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  padding: '15px',
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  borderRadius: '10px',
  flexWrap: 'wrap',
  gap: '15px'
};

const playerInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flex: 1
};

const playerBadgeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap'
};

const playerNameStyle = {
  fontWeight: 'bold',
  fontSize: '18px',
  color: 'white'
};

const roleBadgeStyle = (isCantador) => ({
  backgroundColor: isCantador ? '#FF5722' : '#4CAF50',
  color: 'white',
  padding: '5px 10px',
  borderRadius: '15px',
  fontSize: '12px',
  fontWeight: 'bold'
});

const roomIdStyle = {
  fontSize: '14px',
  color: '#ccc'
};

const playersInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};

const playersCountStyle = {
  fontSize: '14px',
  color: '#4CAF50',
  fontWeight: 'bold'
};

const playersListPreviewStyle = {
  fontSize: '12px',
  color: '#666',
  fontStyle: 'italic',
  maxWidth: '200px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const currentCardStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: 'white',
  textAlign: 'center',
  flex: 1,
  minWidth: '200px'
};

const currentCardContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '5px'
};

const currentCardMainStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#FFD700'
};

const cardNameStyle = {
  fontSize: '14px',
  color: '#ccc'
};

const waitingStyle = {
  fontSize: '16px',
  color: '#ccc',
  fontStyle: 'italic'
};

const playersPanelStyle = {
  backgroundColor: 'rgba(255, 87, 34, 0.1)',
  padding: '15px',
  borderRadius: '10px',
  marginBottom: '15px',
  border: '2px solid #FF5722'
};

const playersTitleStyle = {
  fontWeight: 'bold',
  color: '#FF5722',
  marginBottom: '10px',
  textAlign: 'center'
};

const playersListStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '8px'
};

const playerItemStyle = (isCurrent) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px',
  backgroundColor: isCurrent ? '#FF5722' : 'rgba(255, 87, 34, 0.1)',
  color: isCurrent ? 'white' : '#333',
  borderRadius: '5px',
  fontSize: '14px'
});

const playerIconStyle = {
  fontSize: '16px'
};

const controlPanelStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '10px',
  marginBottom: '20px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const cantadorPanelStyle = {
  textAlign: 'center'
};

const jugadorPanelStyle = {
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  flexWrap: 'wrap',
  marginBottom: '15px'
};

const cantarButtonStyle = {
  padding: '15px 25px',
  backgroundColor: '#FF5722',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
  minWidth: '180px'
};

const reclamarButtonStyle = (hasWinningPattern) => ({
  padding: '15px 25px',
  backgroundColor: hasWinningPattern ? '#FF9800' : '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
  minWidth: '180px'
});



const patternIndicatorStyle = {
  color: '#4CAF50',
  fontWeight: 'bold',
  fontSize: '14px'
};

const winnerStyle = (isPlayer) => ({
  backgroundColor: isPlayer ? '#4CAF50' : '#FF9800',
  color: 'white',
  padding: '20px',
  borderRadius: '10px',
  marginBottom: '20px',
  textAlign: 'center',
  fontSize: '20px',
  fontWeight: 'bold'
});

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '10px',
  margin: '0 auto',
  maxWidth: '600px'
};

const loadingStyle = {
  gridColumn: '1 / -1',
  textAlign: 'center',
  padding: '40px',
  fontSize: '18px',
  color: '#666'
};

const gameInfoStyle = {
  marginTop: '20px',
  padding: '15px',
  backgroundColor: 'white',
  borderRadius: '8px',
  textAlign: 'center',
  fontSize: '14px',
  fontWeight: 'bold',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '20px',
  flexWrap: 'wrap'
};

const validPatternStyle = {
  color: '#4CAF50'
};

const waitingCantadorStyle = {
  color: '#FF5722'
};
