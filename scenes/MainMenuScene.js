class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        // Load menu assets here
    }

    create() {
        // Create menu UI elements
        const title = this.add.text(this.cameras.main.centerX, 200, 'Speed Climber', {
            fontSize: '64px',
            fill: '#000'
        }).setOrigin(0.5);

        const startButton = this.add.text(this.cameras.main.centerX, 400, 'Start Game', {
            fontSize: '32px',
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        startButton.on('pointerdown', () => {
            this.scene.start('NameEntryScene');
        });
    }

    update() {
        // Menu update logic if needed
    }
} 