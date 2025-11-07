class WaitingPlayer extends Phaser.Scene {
    constructor(){
        super("WaitingPlayer");
    }

    create(data){
        this.add.text(640, 360, "Waiting Player", {
            fontFamily: "Arial",
            fontSize: "32px",
        }).setOrigin(0.5);

        const gameTimer = data.gameTimer;

        this.socket = io();
        this.registry.set("socket", this.socket);

        this.socket.emit("playerSearch", { gameTimer: gameTimer });

        this.socket.on("playerInfo", (data) => {
            this.playerNumber = data.playerNumber;
            this.registry.set("playerNumber", data.playerNumber); 
        });

        this.socket.on("gameStart", (data) => {
            this.scene.start("Play", { 
                roomId: data.roomId,
                board: data.board,
                currentPlayer: data.currentPlayer,
                timer: data.timer
            });
        });
    }
}