var config = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    width: 1280,
    height: 720,
    backgroundColor: 0x000000,
    scene: [Menu, QuickGame, FindRoom, Play, Winner, WaitingPlayer],
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            gravity: {
                y: 0,
            }
        }
    },
}

var game = new Phaser.Game(config);