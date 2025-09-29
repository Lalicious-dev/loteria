// src/components/Board3D.jsx - VERSIÓN COMPACTA
import React, { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import Card3D from './Card3D';
import JoinScreen from './JoinScreen';
import { audioManager } from '../utils/AudioManager';
import { checkWin, generateEmptyDrawn } from '../utils/game';
import { getCardInfo } from '../utils/loteriaNumbers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faUser,
  faDoorOpen,
  faCrown,
  faUsers,
  faTrophy,
  faGamepad,
  faClock,
  faCheckCircle,
  faBell,
  faSpinner,
  faMapMarkerAlt,
  faStar
} from '@fortawesome/free-solid-svg-icons';

const socket = io('http://192.168.0.101:3000');

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
  const [markerType, setMarkerType] = useState('bean');

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

    console.log('🔊 Preloading sounds for', allCards.length, 'cards...');

    allCards.forEach(card => {
      audioManager.preloadCardSound(card);
    });

    audioManager.preloadCardSound('victory');
    audioManager.preloadCardSound('error');
  }, []);

  useEffect(() => {

    if (!gameStarted) return;

    socket.emit('joinRoom', { roomId, playerName, isCantador });
    preloadAllCardSounds();

    const handleBoard = ({ board: serverBoard, rows, cols }) => {
      console.log('🃏 Board received:', serverBoard);
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
      console.log('🎴 Card called:', card);
      setCurrentCard(card);
      audioManager.playCardSound(card);
    };

    const handleNoMoreCards = () => {
      alert('No more cards left!');
      audioManager.playCardSound('error');
    };

    const handleSomeoneWon = ({ player }) => {
      console.log('🏆 Winner:', player);
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
        alert(result.error || '❌ You do not have a valid winning pattern.');
        audioManager.playError();
      }
      setMarkedCards(generateEmptyDrawn());
      setCurrentCard(null);
    };

    const handlePlayersUpdate = ({ players: connectedPlayers }) => {
      console.log('👥 Players updated:', connectedPlayers);
      setPlayers(connectedPlayers);
    };

    const handleCantadorUpdate = ({ cantador }) => {
      console.log('🎤 Caller updated:', cantador);
      setIsCantador(cantador === playerName);
    };

    socket.on('board', handleBoard);
    socket.on('cardDrawn', handleCardDrawn);
    socket.on('noMoreCards', handleNoMoreCards);
    socket.on('someoneWon', handleSomeoneWon);
    socket.on('claimResult', handleClaimResult);
    socket.on('playersUpdate', handlePlayersUpdate);
    socket.on('cantadorUpdate', handleCantadorUpdate);

    return () => {
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
      {/* COMPACT HEADER */}
      <div style={headerStyle}>
        <div style={playerInfoStyle}>
          <div style={playerBadgeStyle}>
            <span style={playerNameStyle}>
              <FontAwesomeIcon icon={isCantador ? faMicrophone : faUser} style={{ marginRight: '6px', fontSize: '14px' }} />
              {playerName}
            </span>
            <span style={roleBadgeStyle(isCantador)}>
              {isCantador ? 'Caller' : 'Player'}
            </span>
            <span style={roomIdStyle}>
              <FontAwesomeIcon icon={faDoorOpen} style={{ marginRight: '4px', fontSize: '12px' }} />
              {roomId}
            </span>
          </div>

          <div style={playersInfoStyle}>
            <span style={playersCountStyle}>
              <FontAwesomeIcon icon={faUsers} style={{ marginRight: '4px', fontSize: '12px' }} />
              {players.length}
            </span>
          </div>
        </div>

        <div style={currentCardStyle}>
          {currentCard ? (
            <div style={currentCardContentStyle}>
              <div style={currentCardMainStyle}>
                <FontAwesomeIcon icon={faGamepad} style={{ marginRight: '6px', fontSize: '14px' }} />
                {getCardInfo(currentCard).phonetic}
              </div>
              <div style={cardNameStyle}>{currentCard}</div>
            </div>
          ) : (
            <div style={waitingStyle}>
              <FontAwesomeIcon icon={isCantador ? faMicrophone : faClock} style={{ marginRight: '6px', fontSize: '14px' }} />
              {isCantador ? 'Ready' : 'Waiting...'}
            </div>
          )}
        </div>
      </div>

      {/* PLAYERS LIST (ONLY FOR CALLER) - COMPACT */}
      {isCantador && players.length > 0 && (
        <div style={playersPanelStyle}>
          <div style={playersTitleStyle}>
            <FontAwesomeIcon icon={faUsers} style={{ marginRight: '6px', fontSize: '12px' }} />
            Players ({players.length})
          </div>
          <div style={playersListStyle}>
            {players.map((player, index) => (
              <div key={index} style={playerItemStyle(player === playerName)}>
                <FontAwesomeIcon icon={player === playerName ? faCrown : faUser} style={{ fontSize: '12px', marginRight: '6px' }} />
                {player} {player === playerName && '(You)'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WINNER NOTIFICATION - COMPACT */}
      {winner && (
        <div style={winnerStyle(winner === playerName)}>
          <FontAwesomeIcon icon={faTrophy} style={{ marginRight: '8px', fontSize: '16px' }} />
          {winner === playerName ? 'YOU WIN!' : `${winner} won!`}
        </div>
      )}

      {/* COMPACT CONTROL PANEL */}
      <div style={controlPanelStyle}>
        {isCantador ? (
          <div style={cantadorPanelStyle}>
            <div style={buttonContainerStyle}>
              <button
                onClick={handleDraw}
                disabled={!!winner}
                style={cantarButtonStyle}
              >
                <FontAwesomeIcon icon={faMicrophone} style={{ marginRight: '6px', fontSize: '14px' }} />
                Call
              </button>
              <button
                onClick={handleClaim}
                disabled={markedCards.size === 0 || !!winner}
                style={reclamarButtonStyle(hasWinningPattern)}
              >
                <FontAwesomeIcon icon={hasWinningPattern ? faTrophy : faBell} style={{ marginRight: '6px', fontSize: '14px' }} />
                {hasWinningPattern ? 'Lottery!' : 'Claim'}
              </button>
              {/* Selector de marcadores en línea con los botones */}
              <div style={markerSelectorStyle}>
                <label style={markerLabelStyle}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '6px', fontSize: '14px' }} />
                  Marker:
                </label>
                <select
                  value={markerType}
                  onChange={(e) => setMarkerType(e.target.value)}
                  style={markerSelectStyle}
                >
                  <option value="bean">Bean</option>
                  <option value="corn">Corn</option>
                  <option value="token">Token</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div style={jugadorPanelStyle}>
            <div style={buttonContainerStyle}>
              <button
                onClick={handleClaim}
                disabled={markedCards.size === 0 || !!winner}
                style={reclamarButtonStyle(hasWinningPattern)}
              >
                <FontAwesomeIcon icon={hasWinningPattern ? faTrophy : faBell} style={{ marginRight: '6px', fontSize: '14px' }} />
                {hasWinningPattern ? 'Lottery!' : 'Claim'}
              </button>
              {/* Selector de marcadores en línea con el botón para jugadores */}
              <div style={markerSelectorStyle}>
                <label style={markerLabelStyle}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '6px', fontSize: '14px' }} />
                  Marker:
                </label>
                <select
                  value={markerType}
                  onChange={(e) => setMarkerType(e.target.value)}
                  style={markerSelectStyle}
                >
                  <option value="bean">Bean</option>
                  <option value="corn">Corn</option>
                  <option value="token">Token</option>
                </select>
              </div>
            </div>
            {hasWinningPattern && !winner && (
              <div style={patternIndicatorStyle}>
                <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '6px', fontSize: '12px' }} />
                Winning pattern
              </div>
            )}
          </div>
        )}
      </div>

      {/* CARD BOARD */}
      <div style={gridStyle}>
        {board.length > 0 ? (
          board.map((card, idx) => (
            <Card3D
              key={`${card}-${idx}`}
              card={card}
              selected={markedCards.has(card)}
              onClick={() => toggleCard(card)}
              isCurrent={currentCard === card}
              markerType={markerType}
            />
          ))
        ) : (
          <div style={loadingStyle}>
            <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px', fontSize: '16px' }} />
            Loading...
          </div>
        )}
      </div>

      {/* COMPACT GAME INFO */}
      <div style={gameInfoStyle}>
        <span>
          <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '4px', fontSize: '12px' }} />
          {markedCards.size}/16
        </span>
        {hasWinningPattern && (
          <span style={validPatternStyle}>
            <FontAwesomeIcon icon={faStar} style={{ marginRight: '4px', fontSize: '12px' }} />
            Valid
          </span>
        )}
      </div>
    </div>
  );
}

// Compact Styles
const containerStyle = {
  padding: '10px',
  fontFamily: 'Arial, sans-serif',
  maxWidth: '800px',
  margin: '0 auto',
  background: 'linear-gradient(135deg, #ff1493 0%, #000000 100%)',
  borderRadius: '15px',
  minHeight: '100vh',
  border: '2px solid #ff1493',
  boxShadow: '0 8px 30px rgba(255, 20, 147, 0.5)'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',
  padding: '12px',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: '12px',
  flexWrap: 'wrap',
  gap: '10px',
  border: '2px solid #ff1493',
  boxShadow: '0 3px 6px rgba(255, 20, 147, 0.3)'
};

const playerInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  flex: 1
};

const playerBadgeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap'
};

const playerNameStyle = {
  fontWeight: 'bold',
  fontSize: '14px',
  color: 'white',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
};

const roleBadgeStyle = (isCantador) => ({
  backgroundColor: isCantador ? '#ff1493' : '#ff69b4',
  color: 'white',
  padding: '3px 8px',
  borderRadius: '12px',
  fontSize: '10px',
  fontWeight: 'bold',
  boxShadow: '0 1px 3px rgba(255, 20, 147, 0.3)'
});

const roomIdStyle = {
  fontSize: '11px',
  color: '#ff69b4',
  fontWeight: 'bold',
  padding: '3px 8px',
  backgroundColor: 'rgba(255, 20, 147, 0.2)',
  borderRadius: '8px'
};

const playersInfoStyle = {
  display: 'flex',
  alignItems: 'center'
};

const playersCountStyle = {
  fontSize: '12px',
  color: '#ff69b4',
  fontWeight: 'bold',
  padding: '4px 8px',
  backgroundColor: 'rgba(255, 20, 147, 0.2)',
  borderRadius: '8px'
};

const currentCardStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: 'white',
  textAlign: 'center',
  minWidth: '150px'
};

const currentCardContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '3px'
};

const currentCardMainStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#FFD700',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
};

const cardNameStyle = {
  fontSize: '12px',
  color: '#ff69b4'
};

const waitingStyle = {
  fontSize: '14px',
  color: '#ff69b4',
  fontStyle: 'italic'
};

const playersPanelStyle = {
  backgroundColor: 'rgba(255, 20, 147, 0.1)',
  padding: '10px',
  borderRadius: '12px',
  marginBottom: '12px',
  border: '1px solid #ff1493',
  boxShadow: '0 2px 5px rgba(255, 20, 147, 0.3)'
};

const playersTitleStyle = {
  fontWeight: 'bold',
  color: '#ff69b4',
  marginBottom: '8px',
  textAlign: 'center',
  fontSize: '13px'
};

const playersListStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
  justifyContent: 'center'
};

const playerItemStyle = (isCurrent) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  backgroundColor: isCurrent ? '#ff1493' : 'rgba(255, 20, 147, 0.1)',
  color: isCurrent ? 'white' : '#ff69b4',
  borderRadius: '6px',
  fontSize: '11px',
  border: '1px solid #ff1493'
});

const controlPanelStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  padding: '12px',
  borderRadius: '12px',
  marginBottom: '15px',
  boxShadow: '0 2px 5px rgba(255, 20, 147, 0.3)',
  border: '1px solid #ff1493'
};

const cantadorPanelStyle = {
  textAlign: 'center'
};

const jugadorPanelStyle = {
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  alignItems: 'center'
};


const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center', 
  gap: '12px',
  flexWrap: 'wrap'
};

const cantarButtonStyle = {
  padding: '10px 16px',
  background: 'linear-gradient(135deg, #ff1493 0%, #000000 100%)',
  color: 'white',
  border: '1px solid #ff1493',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 'bold',
  minWidth: '100px',
  boxShadow: '0 2px 4px rgba(255, 20, 147, 0.4)',
  transition: 'all 0.2s',
  '&:hover:not(:disabled)': {
    transform: 'translateY(-1px)',
    boxShadow: '0 3px 6px rgba(255, 20, 147, 0.6)'
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #666 0%, #333 100%)',
    borderColor: '#666',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none'
  }
};

const reclamarButtonStyle = (hasWinningPattern) => ({
  padding: '10px 16px',
  background: hasWinningPattern
    ? 'linear-gradient(135deg, #FFD700 0%, #ff9800 100%)'
    : 'linear-gradient(135deg, #ff69b4 0%, #2a2a2a 100%)',
  color: 'white',
  border: hasWinningPattern ? '1px solid #FFD700' : '1px solid #ff69b4',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 'bold',
  minWidth: '100px',
  boxShadow: hasWinningPattern
    ? '0 2px 4px rgba(255, 215, 0, 0.4)'
    : '0 2px 4px rgba(255, 105, 180, 0.4)',
  transition: 'all 0.2s',
  textShadow: '0 1px 1px rgba(0, 0, 0, 0.5)',
  '&:hover:not(:disabled)': {
    transform: 'translateY(-1px)',
    boxShadow: hasWinningPattern
      ? '0 3px 6px rgba(255, 215, 0, 0.6)'
      : '0 3px 6px rgba(255, 105, 180, 0.6)'
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #666 0%, #333 100%)',
    borderColor: '#666',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none'
  }
});

const patternIndicatorStyle = {
  color: '#ff69b4',
  fontWeight: 'bold',
  fontSize: '11px'
};

const winnerStyle = (isPlayer) => ({
  background: isPlayer
    ? 'linear-gradient(135deg, #4CAF50 0%, #2a2a2a 100%)'
    : 'linear-gradient(135deg, #FF9800 0%, #2a2a2a 100%)',
  color: 'white',
  padding: '12px',
  borderRadius: '10px',
  marginBottom: '15px',
  textAlign: 'center',
  fontSize: '16px',
  fontWeight: 'bold',
  border: '1px solid #ff1493',
  boxShadow: '0 4px 8px rgba(255, 20, 147, 0.5)'
});

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '8px',
  margin: '0 auto',
  maxWidth: '500px'
};

const loadingStyle = {
  gridColumn: '1 / -1',
  textAlign: 'center',
  padding: '30px',
  fontSize: '16px',
  color: '#ff69b4'
};

const gameInfoStyle = {
  marginTop: '15px',
  padding: '10px',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: '8px',
  textAlign: 'center',
  fontSize: '12px',
  fontWeight: 'bold',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '15px',
  flexWrap: 'wrap',
  border: '1px solid #ff1493',
  color: '#ffffffff'
};

const validPatternStyle = {
  color: '#FFD700',
  textShadow: '0 1px 1px rgba(0, 0, 0, 0.5)'
};
const markerSelectorStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const markerLabelStyle = {
  fontSize: '12px',
  color: '#ffffffff',
  fontWeight: 'bold',
  whiteSpace: 'nowrap' 
};

// Si quieres que el selector tenga la misma altura que los botones, puedes ajustar:
const markerSelectStyle = {
  padding: '8px 10px', // Similar padding a los botones
  borderRadius: '6px',
  border: '1px solid #ff1493',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: '#ff69b4',
  fontSize: '12px',
  minWidth: '80px',
  height: '38px', // Altura similar a los botones
  boxSizing: 'border-box'
};