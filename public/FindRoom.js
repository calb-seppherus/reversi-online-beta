class FindRoom extends Phaser.Scene{
    constructor(){
        super("FindRoom")
    }

    create(){
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
            backButton.setBackgroundColor("#8d8d8d");
        })
        .on("pointerout", () => {
            backButton.setBackgroundColor("#ff3b30");
        })
        .on("pointerdown", () => {
            this.scene.start("Menu");
        })
    }
}