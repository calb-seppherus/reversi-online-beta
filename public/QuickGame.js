class QuickGame extends Phaser.Scene{
    constructor(){
        super("QuickGame")
    }

    create(){
        this.add.text(640, 100, "Quick Game", {
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
            backButton.setBackgroundColor("#34c759");
        })
        .on("pointerdown", () => {
            this.scene.start("Menu");
        })

        min1Button
        .on("pointerover", () => {
            min1Button.setBackgroundColor("#8d8d8d");
        })
        .on("pointerout", () => {
            min1Button.setBackgroundColor("#34c759");
        })
        .on("pointerdown", () => {
            this.scene.start("WaitingPlayer", {gameTimer: 60});
        })

        min5Button
        .on("pointerover", () => {
            min5Button.setBackgroundColor("#8d8d8d");
        })
        .on("pointerout", () => {
            min5Button.setBackgroundColor("#34c759");
        })
        .on("pointerdown", () => {
            this.scene.start("WaitingPlayer", {gameTimer: 300});
        })

        min10Button
        .on("pointerover", () => {
            min10Button.setBackgroundColor("#8d8d8d");
        })
        .on("pointerout", () => {
            min10Button.setBackgroundColor("#34c759");
        })
        .on("pointerdown", () => {
            this.scene.start("WaitingPlayer", {gameTimer: 600});
        })
    }
}