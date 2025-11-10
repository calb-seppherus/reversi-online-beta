class FindRoom extends Phaser.Scene{
    constructor(){
        super("FindRoom")
    }

    create(){
        this.socket = this.registry.get("socket"); 
        if (!this.socket) {
            this.socket = io();
            this.registry.set("socket", this.socket);
        }

        const backButton = this.add.text(10, 10, "Back", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff",
            align: "center",
            fixedWidth: 0,
            backgroundColor: "#ff3b30"
        }).setPadding(16).setOrigin(0, 0);

        backButton.setInteractive({ useHandCursor: true });

        backButton
        .on("pointerover", () => {
            backButton.setBackgroundColor("#8d8d8d")
        })
        .on("pointerout", () => {
            backButton.setBackgroundColor("#ff3b30")
        })
        .on("pointerdown", () => {
            this.scene.start("Menu")
        });


        const createRoomButton = this.add.text(640, 200, "Create Private Room", {
            fontFamily: "Arial", 
            fontSize: "32px", 
            backgroundColor: "#007aff" 
        }).setPadding(16).setOrigin(0.5);

        createRoomButton.setInteractive({ useHandCursor: true });
        createRoomButton
        .on("pointerover", () => {
            createRoomButton.setBackgroundColor("#8d8d8d")
        })
        .on("pointerout", () => {
            createRoomButton.setBackgroundColor("#007aff")
        })
        .on("pointerdown", () => {
            this.scene.start("SetTimer");
        });

        
        this.add.text(640, 300, "Enter Room ID to Join:", { fontSize: "24px" }).setOrigin(0.5);

        
        const roomInput = this.add.dom(640, 350).createElement("input", {
            type: "text",
            style: "font-size: 24px; width: 150px; text-align: center; text-transform: uppercase;",
            maxLength: 5
        }).setOrigin(0.5);

        const joinButton = this.add.text(640, 410, "Join", {
            fontFamily: "Arial",
            fontSize: "32px",
            backgroundColor: "#34c759", 
        }).setPadding(16).setOrigin(0.5);
        
        joinButton.setInteractive({ useHandCursor: true });

        joinButton
        .on("pointerover", () => {
            joinButton.setBackgroundColor("#8d8d8d");
        })
        .on("pointerout", () => {
            joinButton.setBackgroundColor("#34c759");
        })
        .on("pointerdown", () => {
            const roomId = roomInput.node.value.toUpperCase();
            if (roomId.length === 5) {
                this.socket.emit("joinRoom", { roomId: roomId });
            } else {
                this.statusText.setText("Room ID must be 5 characters.");
            }
        });


        this.statusText = this.add.text(640, 500, "", { fontSize: "20px", color: "#ff3b30" }).setOrigin(0.5);


        this.socket.on("joinError", (data) => {
            this.statusText.setText(`${data.message}`);
        });

        this.socket.on("gameStart", (data) => {
            this.socket.off("roomCreated");
            this.socket.off("joinError");
            this.socket.off("gameStart");
            
            this.scene.start("Play", data);
        });

        this.socket.on("playerInfo", (data) => {
            this.registry.set("playerNumber", data.playerNumber);
        });
    }

    shutdown() {
        this.socket.off("roomCreated");
        this.socket.off("joinError");
        this.socket.off("gameStart");
        this.socket.off("playerInfo");
    }
}