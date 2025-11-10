class SetTimer extends Phaser.Scene{
    constructor(){
        super("SetTimer")
    }

    create(){
        this.socket = this.registry.get("socket");
        if (!this.socket) {
            this.socket = io();
            this.registry.set("socket", this.socket)
        }

        this.add.text(640, 100, "Select a timer", {
            fontFamily: "Arial",
            fontSize: "32px",
        }).setOrigin(0.5);

        const backButton = this.add.text(10, 10, "Back", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff",
            align: "center",
            fixedWidth: 0,
            backgroundColor: "#ff3b30"
        }).setPadding(16).setOrigin(0, 0);

        const min1Button = this.add.text(config.width / 2 - 200, config.height / 2, "1 Min", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff",
            align: "center",
            fixedWidth: 150,
            backgroundColor: "#34c759"
        }).setPadding(16).setOrigin(0.5);
        
        const min5Button = this.add.text(config.width / 2, config.height / 2, "5 Min", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff",
            align: "center",
            fixedWidth: 150,
            backgroundColor: "#34c759"
        }).setPadding(16).setOrigin(0.5);

        const min10Button = this.add.text(config.width / 2 + 200, config.height / 2, "10 Min", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff",
            align: "center",
            fixedWidth: 150,
            backgroundColor: "#34c759"
        }).setPadding(16).setOrigin(0.5);

        backButton.setInteractive({ useHandCursor: true})
        min1Button.setInteractive({ useHandCursor: true });
        min5Button.setInteractive({ useHandCursor: true });
        min10Button.setInteractive({ useHandCursor: true });

        backButton
        .on("pointerover", () => {
            backButton.setBackgroundColor("#8d8d8d");
        })
        .on("pointerout", () => {
            backButton.setBackgroundColor("#ff3b30");
        })
        .on("pointerdown", () => {
            this.scene.start("FindRoom");
        })

        min1Button
        .on("pointerover", () => {
            min1Button.setBackgroundColor("#8d8d8d");
        })
        .on("pointerout", () => {
            min1Button.setBackgroundColor("#34c759");
        })
        .on("pointerdown", () => {
            this.socket.emit("createRoom", { gameTimer: 60});
        })

        min5Button
        .on("pointerover", () => {
            min5Button.setBackgroundColor("#8d8d8d");
        })
        .on("pointerout", () => {
            min5Button.setBackgroundColor("#34c759");
        })
        .on("pointerdown", () => {
            this.socket.emit("createRoom", { gameTimer: 300 });
        })

        min10Button
        .on("pointerover", () => {
            min10Button.setBackgroundColor("#8d8d8d");
        })
        .on("pointerout", () => {
            min10Button.setBackgroundColor("#34c759");
        })
        .on("pointerdown", () => {
            this.socket.emit("createRoom", { gameTimer: 600 });
        })

        this.statusText = this.add.text(640, 500, "", { fontSize: "20px", color: "#ffffff" }).setOrigin(0.5);

        this.socket.on("roomCreated", (data) => {
            backButton.setVisible(false);
            min10Button.setVisible(false); 
            min5Button.setVisible(false);
            min1Button.setVisible(false);

            this.statusText.setText(`Room created! Share code: ${data.roomId}\nWaiting for opponent...`);
            
            this.registry.set("playerNumber", data.playerNumber); 
        })

        this.socket.on("gameStart", (data) => {
            this.socket.off("roomCreated");
            this.socket.off("joinError");
            this.socket.off("gameStart");
            
            this.scene.start("Play", data);
        }); 
    }
}