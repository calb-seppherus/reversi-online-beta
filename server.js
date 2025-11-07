import express from "express"
import { createServer} from "http"
import { Server } from "socket.io";

var app = express();
const server = createServer(app);

var io = new Server(server);

app.use(express.static("public"));

let players = {};
let waitingPlayer = null;
let gameRooms = {};

const PLAYERS = {
	white: 1,
	black: 2
}

function generateRoomId() {
    // Generate a 5-character alphanumeric ID
    let id = Math.random().toString(36).substring(2, 7).toUpperCase();
    // Ensure it"s not already in use (rare, but good to check)
    while (gameRooms[id]) {
        id = Math.random().toString(36).substring(2, 7).toUpperCase();
    }
    return id;
}

/*
app.get("/", function (req, res) {
  res.sendFile("index.html", { root: "." })
});
*/
function getInitialBoard() {
    let board = [];
    for (let x = 0; x < 8; x++) {
        board[x] = [];
        for (let y = 0; y < 8; y++) {
            board[x][y] = null;
        }
    }
    board[3][3] = PLAYERS.white;
    board[4][3] = PLAYERS.black;
    board[3][4] = PLAYERS.black;
    board[4][4] = PLAYERS.white;
    return board;
}

function Between(x, y, board, player) {
    if (board[x][y] !== null) return [];

    let spots = [];
    let temp = [];
    let connected = false;

    let ox = x;
    let oy = y;

    const reset = () => {
        temp = [];
        connected = false;
        ox = x;
        oy = y;
    }

    const spotting = () => {
        if (ox === 8 || ox === -1 || oy == 8 || oy === -1) return false;
        const spot = board[ox][oy];
        if (spot === null) return false;
        if (spot === player) {
            connected = true;
            return false;
        }

        temp.push({ x: ox, y: oy });
        return true;
    }

    while(true){ 
		ox++; if(!spotting()) break; 
	};
    if (connected) spots = spots.concat(temp);
    reset();
    // horizontal left
    while(true){
		 ox--; if(!spotting()) break; 
	};
    if (connected) spots = spots.concat(temp);
    reset();
    // vertical bottom
    while(true){
		oy++; if(!spotting()) break; 
	};
    if (connected) spots = spots.concat(temp);
    reset();
    // vertical top
    while(true){ 
		oy--; if(!spotting()) break; 
	};
    if (connected) spots = spots.concat(temp);
    reset();
    // diagonal top right
    while(true){ 
		ox++; oy--; if(!spotting()) break; 
	};
    if (connected) spots = spots.concat(temp);
    reset();
    // diagonal top left
    while(true){ 
		ox--; oy--; if(!spotting()) break; 
	};
    if (connected) spots = spots.concat(temp);
    reset();
    // diagonal bottom right
    while(true){ 
		ox++; oy++; if(!spotting()) break; 
	};
    if (connected) spots = spots.concat(temp);
    reset();
    // diagonal bottom left
    while(true){ 
		ox--; oy++; if(!spotting()) break; 
	};
    if (connected) spots = spots.concat(temp);
    reset();

    return spots;
}

function Available(board, player) {
    const list = [];
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (board[x][y] !== null) continue;
            const spots = Between(x, y, board, player);
            if (spots.length === 0) continue;
            list.push({ x, y });
        }
    }
    return list;
};

function PieceCount(board) {
    let black = 0;
    let white = 0;
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (board[x][y] === PLAYERS.black) black++;
            if (board[x][y] === PLAYERS.white) white++;
        }
    }
    return { black, white };
}

io.on("connection", (socket) => {
  console.log(`A user connected ${socket.id}`);
  players[socket.id] = { id: socket.id };

  socket.on("playerSearch", (data) => {
    const { gameTimer } = data;

    if (!waitingPlayer){
        waitingPlayer = socket;
        players[socket.id].playerNumber = 1;
        socket.emit("playerInfo", { playerNumber: 1 });
    } else {
        const player1 = waitingPlayer;
        const player2 = socket;
        players[player2.id].playerNumber = 2;

        const roomId = `${player1.id}-${player2.id}`;
        
        player1.join(roomId);
        player2.join(roomId);

        const initialBoard = getInitialBoard();
        gameRooms[roomId] = {
            players: [player1.id, player2.id],
            currentPlayer: PLAYERS.black,
            board: initialBoard,
            timer: gameTimer,
            timeLeft: {
                [PLAYERS.white]: gameTimer,
                [PLAYERS.black]: gameTimer
            },
            lastMoveTime: Date.now()
        };

        waitingPlayer = null; 

        player1.emit("playerInfo", { playerNumber: 1 });
        player2.emit("playerInfo", { playerNumber: 2 });

        console.log(`Game starting in room ${roomId}`);
        io.to(roomId).emit("gameStart", {
            roomId: roomId,
            board: gameRooms[roomId].board,
            currentPlayer: gameRooms[roomId].currentPlayer,
            timer: gameTimer
        });
        startGameTimer(roomId);
    }
  });

  socket.on("createRoom", (data) => {
    const { gameTimer } = data;
    const roomId = generateRoomId();

    // Store this player
    players[socket.id].playerNumber = 1; // Creator is Player 1 (White)
    
    // Create a new room, mark it as "waiting"
    gameRooms[roomId] = {
        players: [socket.id],
        status: "waiting", // <-- New property to track state
        timer: gameTimer,
        // Game state (board, currentPlayer, etc.) will be added when player 2 joins
    };

    // Put the creator in the socket.io room
    socket.join(roomId);
    
    // Send the new Room ID back to the creator
    socket.emit("roomCreated", { roomId: roomId, playerNumber: 1 });
  });

  socket.on("joinRoom", (data) => {
    const { roomId } = data;
    const room = gameRooms[roomId];

    // 1. Validate the room
    if (!room) {
        socket.emit("joinError", { message: "Room not found" });
        return;
    }
    if (room.status !== "waiting") {
        socket.emit("joinError", { message: "This room is already in-game" });
        return;
    }

    // 2. Room is valid, join the player
    console.log(`Player ${socket.id} joining room ${roomId}`);
    players[socket.id].playerNumber = 2; // Joiner is Player 2 (Black)
    
    // Add player to game state and socket.io room
    room.players.push(socket.id);
    room.status = "active"; // Mark room as full
    socket.join(roomId);

    // 3. Set up and start the game (similar to your "playerSearch" logic)
    const initialBoard = getInitialBoard();
    room.board = initialBoard;
    room.currentPlayer = PLAYERS.black; // Black (Player 2) starts
    room.timeLeft = {
        [PLAYERS.white]: room.timer, // Use timer set by creator
        [PLAYERS.black]: room.timer
    };
    room.lastMoveTime = Date.now();

    // 4. Notify players
    const player1 = io.sockets.sockets.get(room.players[0]);
    
    player1.emit("playerInfo", { playerNumber: 1 });
    socket.emit("playerInfo", { playerNumber: 2 }); // "socket" is player2

    io.to(roomId).emit("gameStart", {
        roomId: roomId,
        board: room.board,
        currentPlayer: room.currentPlayer,
        timer: room.timer
    });
    
    // 5. Start the timer
    startGameTimer(roomId);
  });

  socket.on("Select", (data) => {
    const { x, y, roomId } = data;
    const room = gameRooms[roomId];

    if (!room) return;

    const playerNumber = players[socket.id].playerNumber;

    if (playerNumber !== room.currentPlayer) {
        socket.emit("invalidMove", { message: "Not your turn!" });
        return;
    }

    const spots = Between(x, y, room.board, room.currentPlayer);
    if (spots.length === 0) {
        socket.emit("invalidMove", { message: "Invalid move!" });
        return;
    }

    for (const spot of spots) {
        room.board[spot.x][spot.y] = room.currentPlayer;
    }
    room.board[x][y] = room.currentPlayer;

    room.currentPlayer = (room.currentPlayer === PLAYERS.white) ? PLAYERS.black : PLAYERS.white;

    room.lastMoveTime = Date.now();

    let nextPlayerMoves = Available(room.board, room.currentPlayer);

    if (nextPlayerMoves.length === 0) {
        room.currentPlayer = (room.currentPlayer === PLAYERS.white) ? PLAYERS.black : PLAYERS.white;
        let currentPlayerMoves = Available(room.board, room.currentPlayer);
        if (currentPlayerMoves.length === 0) {
            endGame(roomId, "No moves left");
            return;
        }
    }

    io.to(roomId).emit("gameStateUpdate", {
        board: room.board,
        currentPlayer: room.currentPlayer,
        timeLeft: room.timeLeft
    });
  });


  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
    
    if (waitingPlayer && waitingPlayer.id === socket.id) {
        waitingPlayer = null;
    }

    const roomId = Object.keys(gameRooms).find(id => {
        const room = gameRooms[id];
        if (!room) return false; 
        return room.players.includes(socket.id);
    });

    if (roomId) {
        const room = gameRooms[roomId];

        if (room.status === "waiting") {
            console.log(`Deleting waiting room ${roomId} as creator disconnected.`);
            delete gameRooms[roomId];
        } else {
        
        const remainingPlayerId = room.players.find(id => id !== socket.id);

        if (remainingPlayerId) {
            const disconnectedPlayerNumber = players[socket.id].playerNumber;
            
            const winnerText = (disconnectedPlayerNumber === 1) ? "Black Wins" : "White Wins";

            io.to(remainingPlayerId).emit("gameOver", { 
                winner: winnerText, 
                reason: "Opponent disconnected" 
            });
        }

        if (room.timerInterval) {
            clearInterval(room.timerInterval);
        }
        delete gameRooms[roomId];
        }
    }
    
    delete players[socket.id];
  });
});

function startGameTimer(roomId) {
    const room = gameRooms[roomId];
    if (!room) return;

    room.timerInterval = setInterval(() => {
        if (!room) {
            clearInterval(room.timerInterval);
            return;
        }

        const delta = (Date.now() - room.lastMoveTime) / 1000;
        room.lastMoveTime = Date.now();
        
        room.timeLeft[room.currentPlayer] -= delta;

        if (room.timeLeft[room.currentPlayer] <= 0) {
            room.timeLeft[room.currentPlayer] = 0;
            endGame(roomId, "Time out");
            return;
        }

        io.to(roomId).emit("timerUpdate", room.timeLeft);

    }, 1000);
}

function endGame(roomId, reason) {
    const room = gameRooms[roomId];
    if (!room) return;

    if (room.timerInterval) {
        clearInterval(room.timerInterval);
    }

    const { black, white } = PieceCount(room.board);

    let winner = "Draw";
    if (room.timeLeft[PLAYERS.black] === 0 || white > black) {
        winner = "White Wins";
    } else if (room.timeLeft[PLAYERS.white] === 0 || black > white) {
        winner = "Black Wins";
    }

    io.to(roomId).emit("gameOver", { winner: winner, reason: reason });
    
    delete gameRooms[roomId];
}

server.listen(3000, function () {
  console.log(`Listening on ${server.address().port}`);
});