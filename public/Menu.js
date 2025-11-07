class Menu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }

    preload(){
        this.load.spritesheet("grid", "assets/sprites/grid.png", {
            frameWidth: 336,
            frameHeight: 336
        });

        this.load.spritesheet("gridBlack", "assets/sprites/gridBlack.png", {
            frameWidth: 336,
            frameHeight: 336
        });

        this.load.spritesheet("gridWhite", "assets/sprites/gridWhite.png", {
            frameWidth: 336,
            frameHeight: 336
        });
    }

    create (){
        this.add.text(640, 100, "Reversi Online", {
            fontFamily: "Arial",
            fontSize: "32px",
        }).setOrigin(0.5);

        const quickGameButton = this.add.text(config.width / 2, config.height / 2, "Quick Game", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff",
            align: "center",
            fixedWidth: 260,
            backgroundColor: "#34c759"
        }).setPadding(32).setOrigin(0.5);

        const findRoomButton = this.add.text(config.width / 2, config.height / 2 + 240, "Find Room", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff",
            align: "center",
            fixedWidth: 260,
            backgroundColor: "#34c759"
        }).setPadding(32).setOrigin(0.5);

        quickGameButton.setInteractive({ useHandCursor: true });
        findRoomButton.setInteractive({ useHandCursor: true });

        quickGameButton
        .on("pointerover", () => {
            quickGameButton.setBackgroundColor("#8d8d8d");
        })
        .on("pointerout", () => {
            quickGameButton.setBackgroundColor("#34c759");
        })
        .on("pointerdown", () => {
            this.scene.start("QuickGame");
        })

        findRoomButton
        .on("pointerover", () => {
            findRoomButton.setBackgroundColor("#8d8d8d");
        })
        .on("pointerout", () => {
            findRoomButton.setBackgroundColor("#34c759");
        })
        .on("pointerdown", () => {
            this.scene.start("FindRoom");
        })
    }
}