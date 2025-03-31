class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.winner = data.winner;
        this.winningTime = data.winningTime;
        this.player1Name = data.player1Name;
        this.player2Name = data.player2Name;
    }

    preload() {
        // Load any assets needed for game over screen
    }

    create() {
        // Create game over UI
        const title = this.add.text(this.cameras.main.centerX, 200, 'Game Over!', {
            fontSize: '64px',
            fill: '#000'
        }).setOrigin(0.5);

        const winnerText = this.add.text(this.cameras.main.centerX, 300, 
            `${this.winner} wins!\nTime: ${this.winningTime.toFixed(2)}s`, {
            fontSize: '48px',
            fill: '#000',
            align: 'center'
        }).setOrigin(0.5);

        const rematchButton = this.add.text(this.cameras.main.centerX, 400, 'Rematch', {
            fontSize: '32px',
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        rematchButton.on('pointerdown', () => {
            this.scene.start('GameScene', {
                player1Name: this.player1Name,
                player2Name: this.player2Name
            });
        });

        const menuButton = this.add.text(this.cameras.main.centerX, 450, 'Main Menu', {
            fontSize: '32px',
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        menuButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
    }

    update() {
        // Game over update logic if needed
    }
} 