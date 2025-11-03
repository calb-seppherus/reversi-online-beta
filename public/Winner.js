class Winner extends Phaser.Scene {
    constructor(){
        super("Winner");
    }
    create(data){
        const text = this.add.text(config.width / 2, config.height / 2, data.result, {
            fontFamily: "Arial",
            fontSize: "32px",
        }).setOrigin(0.5);

        const button = this.add.text(config.width / 2, config.height / 2 + 100, "Main Menu", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff",
            align: "center",
            fixedWidth: 260,
            backgroundColor: "#34c759"
        }).setPadding(32).setOrigin(0.5);

        button.setInteractive({ useHandCursor: true });

        button
        .on("pointerover", () => {
            button.setBackgroundColor("#8d8d8d");
        })
        .on("pointerout", () => {
            button.setBackgroundColor("#34c759");
        })
        .on("pointerdown", () => {
            text.destroy();
            button.destroy();
            this.scene.start("Menu");
        });
        
    }
}