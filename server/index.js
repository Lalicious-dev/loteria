// server/index.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = 3000;


// ======== UTILIDADES ========

// Cargar deck.json
const deckPath = path.join('./data/deck.json');
const rawDeck = JSON.parse(fs.readFileSync(deckPath, 'utf8'));

// Mezclar un array (Fisher-Yates)
function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Tomar k elementos aleatorios
function sample(array, k) {
  return shuffle(array).slice(0, k);
}

// Generar tablero plano de rows x cols
function generateBoard(deck, rows = 4, cols = 4) {
  return sample(deck.map(c => c.name), rows * cols);
}

// Generar patrones ganadores (filas, columnas, diagonales)
function generateWinPatterns(rows, cols) {
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

  // Diagonales si cuadrado
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
}

// Tomar la siguiente carta no salida del mazo
function drawNext(shuffledDeck, drawnSet) {
  for (const card of shuffledDeck) {
    if (!drawnSet.has(card)) {
      drawnSet.add(card);
      return card;
    }
  }
  return null; // ya no quedan
}

// Validar victoria
function checkWin(playerBoard, drawnSet, patterns) {
  for (const pattern of patterns) {
    if (pattern.every(idx => drawnSet.has(playerBoard[idx]))) {
      return { win: true, pattern };
    }
  }
  return { win: false };
}

// ======== ROOMS ========
const rooms = {}; // rooms[roomId] = { deckShuffled, drawn: Set(), players: {}, patterns }
const roomPlayers = new Map(); // 👈 NUEVO: Para trackear jugadores por nombre

// ======== SOCKET.IO ========
io.on('connection', socket => {
  console.log('Nueva conexión:', socket.id);

  socket.on('joinRoom', ({ roomId, playerName, isCantador }) => { // 👈 AGREGAR isCantador
    socket.join(roomId);

    // 👇 NUEVO: Actualizar lista de jugadores por nombre
    if (!roomPlayers.has(roomId)) {
      roomPlayers.set(roomId, []);
    }
    
    const playersInRoom = roomPlayers.get(roomId);
    if (!playersInRoom.includes(playerName)) {
      playersInRoom.push(playerName);
    }

    // 👇 NUEVO: Emitir actualización de jugadores a TODA la sala
    io.to(roomId).emit('playersUpdate', { players: playersInRoom });

    console.log(`👥 ${playerName} se unió a la sala ${roomId}. Jugadores: ${playersInRoom.length}`);

    // 👇 CÓDIGO EXISTENTE (mantener igual)
    if (!rooms[roomId]) {
      rooms[roomId] = {
        deckShuffled: shuffle(rawDeck.map(c => c.name)),
        drawn: new Set(),
        players: {},
        patterns: generateWinPatterns(4, 4),
        cantador: isCantador ? playerName : null // 👈 NUEVO: Guardar quién es el cantador
      };
    }

    const room = rooms[roomId];
    
    // 👇 NUEVO: Si es el primer jugador y es cantador, asignarlo como cantador
    if (isCantador && !room.cantador) {
      room.cantador = playerName;
    }

    const board = generateBoard(rawDeck, 4, 4);
    room.players[socket.id] = { name: playerName, board };

    socket.emit('board', { board, rows: 4, cols: 4 });

    // 👇 NUEVO: Emitir quién es el cantador actual
    socket.emit('cantadorUpdate', { cantador: room.cantador });
  });

  socket.on('drawCard', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    // 👇 NUEVO: Verificar que solo el cantador puede cantar cartas
    const player = room.players[socket.id];
    if (!player || player.name !== room.cantador) {
      socket.emit('error', { message: 'Solo el cantador puede cantar cartas' });
      return;
    }

    const card = drawNext(room.deckShuffled, room.drawn);
    if (card) {
      io.to(roomId).emit('cardDrawn', { card });
    } else {
      io.to(roomId).emit('noMoreCards');
    }
  });

  socket.on('claimWin', ({ roomId, markedCards }) => {
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players[socket.id];
    if (!player) return;

    const markedSet = new Set(markedCards);

    // ✅ Validación: Verificar que TODAS las cartas marcadas HAYAN SALIDO
    const allMarkedCardsAreDrawn = Array.from(markedSet).every(card =>
      room.drawn.has(card)
    );

    if (!allMarkedCardsAreDrawn) {
      socket.emit('claimResult', {
        win: false,
        error: "❌ ¡Has marcado cartas que no han salido!"
      });
      return;
    }

    // ✅ Validar patrón ganador
    const result = checkWin(player.board, markedSet, room.patterns);

    socket.emit('claimResult', result);

    if (result.win) {
      io.to(roomId).emit('someoneWon', {
        player: player.name,
        pattern: result.pattern,
        winningCards: result.pattern.map(idx => player.board[idx])
      });
    }
  });

  // 👇 NUEVO: Manejar desconexión de jugadores
  socket.on('disconnect', () => {
    console.log('Desconexión:', socket.id);
    
    // Eliminar jugador de roomPlayers (por nombre)
    for (const [roomId, players] of roomPlayers.entries()) {
      const player = rooms[roomId]?.players[socket.id];
      if (player) {
        const updatedPlayers = players.filter(name => name !== player.name);
        roomPlayers.set(roomId, updatedPlayers);
        
        // Notificar a los demás jugadores
        socket.to(roomId).emit('playersUpdate', { players: updatedPlayers });
        
        console.log(`👋 ${player.name} salió de la sala ${roomId}. Jugadores restantes: ${updatedPlayers.length}`);
      }
    }

    // 👇 CÓDIGO EXISTENTE (mantener)
    // eliminar jugador de todas las salas
    for (const roomId in rooms) {
      delete rooms[roomId].players[socket.id];
      // opcional: eliminar room si ya no hay jugadores
      if (Object.keys(rooms[roomId].players).length === 0) {
        delete rooms[roomId];
        roomPlayers.delete(roomId); // 👈 NUEVO: Limpiar también roomPlayers
      }
    }
  });
});

// ======== EXPRESS ========
app.get('/', (req, res) => {
  res.send('Servidor de Lotería Mexicana funcionando 🎉');
});

// ======== SOLO ESTE server.listen ========
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`También accesible desde tu IP local`);
});