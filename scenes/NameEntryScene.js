class NameEntryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'NameEntryScene' });
    }

    preload() {
        // Load any assets needed for name entry
    }

    create() {
        // Create name entry UI
        const title = this.add.text(this.cameras.main.centerX, 200, 'Enter Player Names', {
            fontSize: '48px',
            fill: '#000'
        }).setOrigin(0.5);

        // Player 1 name entry
        const player1Label = this.add.text(this.cameras.main.centerX - 200, 300, 'Player 1:', {
            fontSize: '24px',
            fill: '#000'
        }).setOrigin(0.5);

        const player1Input = this.add.text(this.cameras.main.centerX - 200, 320, '', {
            fontSize: '20px',
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .setStyle({ cursor: 'text' });

        // Player 2 name entry
        const player2Label = this.add.text(this.cameras.main.centerX + 200, 300, 'Player 2:', {
            fontSize: '24px',
            fill: '#000'
        }).setOrigin(0.5);

        const player2Input = this.add.text(this.cameras.main.centerX + 200, 320, '', {
            fontSize: '20px',
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .setStyle({ cursor: 'text' });

        // Start button
        const startButton = this.add.text(this.cameras.main.centerX, 400, 'Start Climbing!', {
            fontSize: '32px',
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        // Input handling
        let activeInput = null;
        let player1Name = '';
        let player2Name = '';

        player1Input.on('pointerdown', () => {
            activeInput = player1Input;
            player1Input.setBackgroundColor('#e0e0e0');
            player2Input.setBackgroundColor('#fff');
        });

        player2Input.on('pointerdown', () => {
            activeInput = player2Input;
            player2Input.setBackgroundColor('#e0e0e0');
            player1Input.setBackgroundColor('#fff');
        });

        this.input.keyboard.on('keydown', (event) => {
            if (activeInput) {
                if (event.key === 'Backspace') {
                    if (activeInput === player1Input) {
                        player1Name = player1Name.slice(0, -1);
                        player1Input.setText(player1Name);
                    } else {
                        player2Name = player2Name.slice(0, -1);
                        player2Input.setText(player2Name);
                    }
                } else if (event.key === 'Enter') {
                    activeInput = null;
                    player1Input.setBackgroundColor('#fff');
                    player2Input.setBackgroundColor('#fff');
                } else if (event.key.length === 1) {
                    if (activeInput === player1Input) {
                        player1Name += event.key;
                        player1Input.setText(player1Name);
                    } else {
                        player2Name += event.key;
                        player2Input.setText(player2Name);
                    }
                }
            }
        });

        startButton.on('pointerdown', () => {
            const finalPlayer1Name = player1Name || 'Player 1';
            const finalPlayer2Name = player2Name || 'Player 2';
            
            // Start game scene with player names
            this.scene.start('GameScene', { 
                player1Name: finalPlayer1Name, 
                player2Name: finalPlayer2Name 
            });
        });
    }

    update() {
        // Name entry update logic if needed
    }
} 