class Play extends Phaser.Scene {
    constructor(){
        super("Play")
    }

    create(data){
        const PLAYERS = {
            white:  1,
            black:  2
        }

        this.socket = this.registry.get('socket');
        this.playerNumber = this.registry.get('playerNumber');
        this.roomId = data.roomId;
        
        this.board = data.board;
        this.currentPlayer = data.currentPlayer;
        this.activePlayer = (this.currentPlayer === PLAYERS.black) ? "black" : "white";

        this.grid = [];
        for(let x = 0 ; x < 8 ; x++){
            this.grid[x] = [];
            for(let y = 0 ; y < 8 ; y++){
                this.grid[x][y] = this.add.sprite(100 + x * 50, 100 + y * 50, "grid");
                this.grid[x][y].displayWidth = 40;
                this.grid[x][y].scaleY = this.grid[x][y].scaleX;
                this.grid[x][y].setInteractive({ cursor: "pointer"});

                this.grid[x][y].on("pointerdown", () => {
                    this.socket.emit('Select', { x: x, y: y, roomId: this.roomId });
                });
            }
        }

        this.blackCountText = this.add.text(200,50,"Blacks: 2");
        this.whiteCountText = this.add.text(400,50,"Whites: 2");

        this.timeLeft = {
            black: data.timer,
            white: data.timer
        };

        this.blackTimerText = this.add.text(550, 200, "Black Timer: " + this.FormatTime(this.timeLeft.black), {
            fontSize: "20px",
            fill: "#fff"
        });
        this.whiteTimerText = this.add.text(550, 300, "White Timer: " + this.FormatTime(this.timeLeft.white), {
            fontSize: "20px",
            fill: "#fff"
        });

        const isMyTurn = (this.currentPlayer === this.playerNumber);
        this.playerTurnText = this.add.text(550, 50, `You are: ${this.playerNumber === 1 ? "White" : "Black"}`, {
            fontSize: "20px",
            fill: isMyTurn ? "#FFF" : "#888"
        });

        this.socket.on('gameStateUpdate', (data) => {
            this.board = data.board;
            this.currentPlayer = data.currentPlayer;
            this.activePlayer = (this.currentPlayer === PLAYERS.black) ? "black" : "white";
            if (this.currentPlayer === this.playerNumber) { 
                this.fill = "#FFF" }
            else {
                this.fill = "#888" }
            this.timeLeft.white = data.timeLeft[PLAYERS.white];
            this.timeLeft.black = data.timeLeft[PLAYERS.black];
            
            this.blackTimerText.setText("Black Timer: " + this.FormatTime(this.timeLeft.black));
            this.whiteTimerText.setText("White Timer: " + this.FormatTime(this.timeLeft.white));

            this.playerTurnText.setFill(this.currentPlayer === this.playerNumber ? "#FFF" : "#888");
        });

        this.socket.on('timerUpdate', (timeLeft) => {
            this.timeLeft.white = timeLeft[PLAYERS.white];
            this.timeLeft.black = timeLeft[PLAYERS.black];
            
            this.blackTimerText.setText("Black Timer: " + this.FormatTime(this.timeLeft.black));
            this.whiteTimerText.setText("White Timer: " + this.FormatTime(this.timeLeft.white));
        });
        
        this.socket.on('gameOver', (data) => {
            this.scene.pause();
            this.scene.start("Winner", { result: data.winner });
        });
        
        this.socket.on('opponentDisconnect', () => {
            this.add.text(640, 360, "Opponent Disconnected", { fontSize: "32px" }).setOrigin(0.5);
            this.scene.pause();
        });

        this.socket.on('invalidMove', (data) => {
            console.log("Invalid move:", data.message);
        });
    }

    update(){
        // Update board textures
        for(let x = 0 ; x < 8 ; x++){
            for(let y = 0 ; y < 8 ; y++){
                if(this.board[x][y] === 2){
                    this.grid[x][y].setTexture("gridBlack");
                }
                else if(this.board[x][y] === 1){
                    this.grid[x][y].setTexture("gridWhite");
                }
                else {
                    this.grid[x][y].setTexture("grid");
                }
            }
        }

        const {black, white} = this.PieceCount();
        this.blackCountText.setText("Blacks: "+ black);
        this.whiteCountText.setText("Whites: "+ white);
    }

    FormatTime(seconds){
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;
    }

    PieceCount(){
        let black = 0;
        let white = 0;

        for(let x = 0 ; x < 8 ; x++){
            for(let y = 0 ; y < 8 ; y++){
                if(this.board[x][y] === 2){
                    black++;
                }
                if(this.board[x][y] === 1){
                    white++;
                }
            }
        }
        return {black, white};
    }

    // REMOVE: Available()
    // REMOVE: Select()
    // REMOVE: GameResult()
    // REMOVE: Between()
}