class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        // Debug flag for countdown
        this.skipCountdown = true; // Set to true to skip countdown, false to show countdown
    }

    init(data) {
        // Set default names
        this.player1Name = 'Player 1';
        this.player2Name = 'Player 2';
        this.gameStarted = false;

        // Sort holds by y-coordinate (bottom to top)
        const holdData = this.holdCoordinates.map((coord, index) => ({
            coord: coord,
            gripPoints: this.holdGrippingPoints[index]
        }));

        // Sort by y-coordinate (descending order)
        holdData.sort((a, b) => b.coord[1] - a.coord[1]);

        // Update the arrays with sorted data
        this.holdCoordinates = holdData.map(data => data.coord);
        this.holdGrippingPoints = holdData.map(data => data.gripPoints);

        // Initialize player hand positions
        this.player1Hands = {
            left: { x: 0, y: 0 },
            right: { x: 0, y: 0 }
        };
        this.player2Hands = {
            left: { x: 0, y: 0 },
            right: { x: 0, y: 0 }
        };
    }

    preload() {
        // Load game assets
        this.load.image('background', 'assets/images/background.jpg');
        this.load.image('wall_left', 'assets/images/wall_left.jpg');
        this.load.image('wall_right', 'assets/images/wall_right.jpg');
    }

    // Define hold coordinates relative to the bottom-center of the wall image
    // Format: [(x, y), ...] where x and y are relative to wall's bottom-center
    holdCoordinates = [
        // Starting hold
        [113, 241],

        // Rest
        // [-97, 278], // foot chip
        [132, 280],
        [36, 396],
        [-77, 510],
        // [74, 547],
        [-19, 627],
        [35, 679],
        [-17, 778],
        [58, 886],
        // [-78, 848],
        // [94, 847],
        // [-17, 944],
        // [-136, 967],
        [94, 1005],
        [-98, 1079],
        [-38, 1175],
        [-115, 1220],
        [-21, 1330],
        [-113, 1419],
        [-37, 1493],
        [-58, 1533],
        [-154, 1668],
        [25, 1768],
        [97, 1869],
        [-35, 1939],

        // Top hold
        [0, 2197]
    ];

    // Define gripping points for each hold
    // Format: [[[left_x, left_y], [right_x, right_y]], ...]
    // Each pair of coordinates is relative to the hold's position
    holdGrippingPoints = [
        // Starting hold
        [[-10, -10], [10, -10]],

        // Rest
        [[-15, -15], [15, -15]],
        [[-12, -12], [12, -12]],
        [[-15, -15], [15, -15]],
        [[-10, -10], [10, -10]],
        [[-12, -12], [12, -12]],
        [[-15, -15], [15, -15]],
        [[-10, -10], [10, -10]],
        [[-15, -15], [15, -15]],
        [[-12, -12], [12, -12]],
        [[-15, -15], [15, -15]],
        [[-10, -10], [10, -10]],
        [[-12, -12], [12, -12]],
        [[-15, -15], [15, -15]],
        [[-10, -10], [10, -10]],
        [[-12, -12], [12, -12]],
        [[-15, -15], [15, -15]],
        [[-10, -10], [10, -10]],
        [[-12, -12], [12, -12]],
        [[-15, -15], [15, -15]],
        [[-10, -10], [10, -10]],
        [[-12, -12], [12, -12]],
        [[-15, -15], [15, -15]],

        // Top hold
        [[-10, -10], [10, -10]]
    ];

    create() {
        // Create background image
        this.add.image(0, 0, 'background').setOrigin(0, 0);

        // Create climbing walls
        this.createClimbingWalls();

        // Create HUD elements
        this.createHUD();

        // Create players
        this.createPlayers();

        // Create holds and sliders
        this.createHolds();

        // Set up input handlers
        this.setupInputHandlers();

        // Create name entry window
        this.createNameEntryWindow();
    }

    createClimbingWalls() {
        // Create left wall
        this.leftWall = this.add.image(455, 816, 'wall_left')
            .setOrigin(0.5, 1) // Set origin to bottom-center
            .setDepth(0); // Place below HUD

        // Create right wall
        this.rightWall = this.add.image(985, 816, 'wall_right')
            .setOrigin(0.5, 1) // Set origin to bottom-center
            .setDepth(0); // Place below HUD

        // Store initial positions for reference
        this.leftWallInitialY = 816;
        this.rightWallInitialY = 816;

        // Movement speed and distance
        this.wallMoveSpeed = 750; // pixels per second
        this.wallMoveDistance = 50; // pixels to move per step

        // Wall boundaries
        this.wallMinY = 816; // Minimum Y position (lowest point)
        this.wallMaxY = 2400; // Maximum Y position (highest point)
        this.wallStepDistance = 250; // Distance to move per step

        // Track current movement state
        this.leftWallMoving = false;
        this.rightWallMoving = false;
    }

    moveWall(wall, direction) {
        const targetWall = wall === 'left' ? this.leftWall : this.rightWall;
        const targetHolds = wall === 'left' ? this.leftWallHolds : this.rightWallHolds;
        const isLeftWall = wall === 'left';
        const currentY = targetWall.y;

        // Stop any existing tweens on this wall and its holds
        this.tweens.killTweensOf(targetWall);
        this.tweens.killTweensOf(targetHolds);

        // Calculate target Y position based on direction and boundaries
        let targetY;
        if (direction === 'up') {
            // When pressing up, move wall down (to simulate climbing up)
            targetY = Math.min(currentY + this.wallStepDistance, this.wallMaxY);
        } else {
            // When pressing down, move wall up (to simulate climbing down)
            targetY = Math.max(currentY - this.wallStepDistance, this.wallMinY);
        }

        // Only move if we're not at the boundary
        if (targetY !== currentY) {
            // Create smooth movement tween for wall
            this.tweens.add({
                targets: targetWall,
                y: targetY,
                duration: 1000, // 1 second duration
                ease: 'Power2', // Smooth easing function
                onComplete: () => {
                    // Reset movement state
                    if (isLeftWall) {
                        this.leftWallMoving = false;
                    } else {
                        this.rightWallMoving = false;
                    }
                }
            });

            // Create smooth movement tween for holds
            this.tweens.add({
                targets: targetHolds,
                y: targetY,
                duration: 1000,
                ease: 'Power2'
            });

            // Set movement state
            if (isLeftWall) {
                this.leftWallMoving = true;
            } else {
                this.rightWallMoving = true;
            }
        }
    }

    createHUD() {
        // Create player 1 name banner
        // new Rectangle(scene, x, y, [width], [height], [fillColor], [fillAlpha])
        const player1BannerCascade = this.add.rectangle(350 + 10, 850 + 10 + 40, 650, 60, 0x393939).setDepth(2);
        const player1Banner = this.add.rectangle(350, 850 + 40, 650, 60, 0xc7c7c7).setDepth(2);
        this.player1NameText = this.add.text(50, 850 + 40, this.player1Name.toUpperCase(), {
            fontSize: '32px',
            fill: '#000',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(0, 0.5).setDepth(2);
        const player1BestTextTip = this.add.text(660, 855 + 22, 'PERSONAL BEST', {
            fontSize: '12px',
            fill: '#000',
            fontFamily: 'PPFraktionSans-Light'
        }).setOrigin(1, 0.5).setDepth(2);
        const player1BestText = this.add.text(660, 855 + 45, '00\'00"000', {
            fontSize: '22px',
            fill: '#000',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(1, 0.5).setDepth(2);

        // Create player 2 name banner
        const player2BannerCascade = this.add.rectangle(1090 - 10, 850 + 10 + 40, 650, 60, 0x393939).setDepth(2);
        const player2Banner = this.add.rectangle(1090, 850 + 40, 650, 60, 0xc7c7c7).setDepth(2);
        this.player2NameText = this.add.text(1390, 850 + 40, this.player2Name.toUpperCase(), {
            fontSize: '32px',
            fill: '#000',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(1, 0.5).setDepth(2);
        const player2BestTextTip = this.add.text(780, 855 + 22, 'PERSONAL BEST', {
            fontSize: '12px',
            fill: '#000',
            fontFamily: 'PPFraktionSans-Light'
        }).setOrigin(0, 0.5).setDepth(2);
        const player2BestText = this.add.text(780, 855 + 45, '00\'00"000', {
            fontSize: '22px',
            fill: '#000',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(0, 0.5).setDepth(2);

        // Create player 1 ticker
        const player1Ticker = this.add.rectangle(111, 770 + 40, 170, 75, 0x393939).setDepth(2);
        const player1TickerText = this.add.text(50, 770 + 40, '0\'00"000', {
            fontSize: '30px',
            fill: '#fff',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(0, 0.5).setDepth(2);

        // Create player 2 ticker
        const player2Ticker = this.add.rectangle(1330, 770 + 40, 170, 75, 0x393939).setDepth(2);
        const player2TickerText = this.add.text(1390, 770 + 40, '0\'00"000', {
            fontSize: '30px',
            fill: '#fff',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(1, 0.5).setDepth(2);

        // Store references for later updates
        this.player1TickerText = player1TickerText;
        this.player2TickerText = player2TickerText;
    }

    createPlayers() {
        // Create player hand containers
        this.player1HandsContainer = this.add.container(455, 816); // Position at left wall's bottom-center
        this.player2HandsContainer = this.add.container(985, 816); // Position at right wall's bottom-center

        // Set depth to be above holds but below HUD
        this.player1HandsContainer.setDepth(1);
        this.player2HandsContainer.setDepth(1);

        // Create hand circles
        this.player1LeftHand = this.add.circle(0, 0, 8, 0xff0000, 1).setStrokeStyle(2, 0xffffff);
        this.player1RightHand = this.add.circle(0, 0, 8, 0xff0000, 1).setStrokeStyle(2, 0xffffff);
        this.player2LeftHand = this.add.circle(0, 0, 8, 0x0000ff, 1).setStrokeStyle(2, 0xffffff);
        this.player2RightHand = this.add.circle(0, 0, 8, 0x0000ff, 1).setStrokeStyle(2, 0xffffff);

        // Add hands to containers
        this.player1HandsContainer.add([this.player1LeftHand, this.player1RightHand]);
        this.player2HandsContainer.add([this.player2LeftHand, this.player2RightHand]);

        // Set initial hand positions to starting hold's gripping points
        const startingHoldIndex = this.holdCoordinates.length - 1; // Last hold is the starting hold
        const startingGripPoints = this.holdGrippingPoints[startingHoldIndex];
        const startingHold = this.holdCoordinates[startingHoldIndex];

        // Set player 1 hands
        this.player1LeftHand.setPosition(
            startingHold[0] + startingGripPoints[0][0],
            -startingHold[1] + startingGripPoints[0][1]
        );
        this.player1RightHand.setPosition(
            startingHold[0] + startingGripPoints[1][0],
            -startingHold[1] + startingGripPoints[1][1]
        );

        // Set player 2 hands
        this.player2LeftHand.setPosition(
            startingHold[0] + startingGripPoints[0][0],
            -startingHold[1] + startingGripPoints[0][1]
        );
        this.player2RightHand.setPosition(
            startingHold[0] + startingGripPoints[1][0],
            -startingHold[1] + startingGripPoints[1][1]
        );

        // Store initial positions
        this.player1Hands.left = {
            x: startingHold[0] + startingGripPoints[0][0],
            y: -startingHold[1] + startingGripPoints[0][1]
        };
        this.player1Hands.right = {
            x: startingHold[0] + startingGripPoints[1][0],
            y: -startingHold[1] + startingGripPoints[1][1]
        };
        this.player2Hands.left = {
            x: startingHold[0] + startingGripPoints[0][0],
            y: -startingHold[1] + startingGripPoints[0][1]
        };
        this.player2Hands.right = {
            x: startingHold[0] + startingGripPoints[1][0],
            y: -startingHold[1] + startingGripPoints[1][1]
        };
    }

    createHolds() {
        // Create containers for holds on each wall
        this.leftWallHolds = this.add.container(455, 816); // Position at left wall's bottom-center
        this.rightWallHolds = this.add.container(985, 816); // Position at right wall's bottom-center

        // Set depth to be below HUD elements
        this.leftWallHolds.setDepth(0);
        this.rightWallHolds.setDepth(0);

        // Draw circles and gripping points at hold positions on both walls
        this.holdCoordinates.forEach((coord, index) => {
            // Add gripping points to left wall
            this.holdGrippingPoints[index].forEach((gripPoint, gripIndex) => {
                const leftGrip = this.add.circle(
                    coord[0] + gripPoint[0], // hold x + grip point x offset
                    -coord[1] + gripPoint[1], // hold y + grip point y offset
                    5, // smaller radius for grip points
                    gripIndex === 0 ? 0x51ab0f : 0xb616ad, // dark green for left grip, purple for right grip
                    1 // alpha
                ).setStrokeStyle(1, 0xffffff); // white stroke
                this.leftWallHolds.add(leftGrip);
            });

            // Add gripping points to right wall
            this.holdGrippingPoints[index].forEach((gripPoint, gripIndex) => {
                const rightGrip = this.add.circle(
                    coord[0] + gripPoint[0], // hold x + grip point x offset
                    -coord[1] + gripPoint[1], // hold y + grip point y offset
                    5, // smaller radius for grip points
                    gripIndex === 0 ? 0x51ab0f : 0xb616ad, // dark green for left grip, purple for right grip
                    1 // alpha
                ).setStrokeStyle(1, 0xffffff); // white stroke
                this.rightWallHolds.add(rightGrip);
            });

            // show the coordinates of the hold in console
            console.log("hold " + index + ": " + coord[0] + ", " + coord[1]);
        });
    }

    setupInputHandlers() {
        // Left wall controls
        this.input.keyboard.on('keydown-ONE', () => {
            this.moveWall('left', 'up');
        });
        this.input.keyboard.on('keydown-TWO', () => {
            this.moveWall('left', 'down');
        });
        this.input.keyboard.on('keydown-THREE', () => {
            this.resetWall('left');
        });
        this.input.keyboard.on('keydown-FOUR', () => {
            this.moveWallToTop('left');
        });

        // Right wall controls
        this.input.keyboard.on('keydown-NINE', () => {
            this.moveWall('right', 'up');
        });
        this.input.keyboard.on('keydown-ZERO', () => {
            this.moveWall('right', 'down');
        });
        this.input.keyboard.on('keydown-EIGHT', () => {
            this.resetWall('right');
        });
        this.input.keyboard.on('keydown-SEVEN', () => {
            this.moveWallToTop('right');
        });
    }

    resetWall(wall) {
        const targetWall = wall === 'left' ? this.leftWall : this.rightWall;
        const targetHolds = wall === 'left' ? this.leftWallHolds : this.rightWallHolds;
        const initialY = wall === 'left' ? this.leftWallInitialY : this.rightWallInitialY;

        // Stop any existing tweens on this wall and its holds
        this.tweens.killTweensOf(targetWall);
        this.tweens.killTweensOf(targetHolds);

        // Create smooth movement tween back to initial position for wall
        this.tweens.add({
            targets: targetWall,
            y: initialY,
            duration: 1000, // 1 second duration
            ease: 'Power2', // Smooth easing function
            onComplete: () => {
                // Reset movement state
                if (wall === 'left') {
                    this.leftWallMoving = false;
                } else {
                    this.rightWallMoving = false;
                }
            }
        });

        // Create smooth movement tween for holds
        this.tweens.add({
            targets: targetHolds,
            y: initialY,
            duration: 1000,
            ease: 'Power2'
        });

        // Set movement state
        if (wall === 'left') {
            this.leftWallMoving = true;
        } else {
            this.rightWallMoving = true;
        }
    }

    moveWallToTop(wall) {
        const targetWall = wall === 'left' ? this.leftWall : this.rightWall;
        const targetHolds = wall === 'left' ? this.leftWallHolds : this.rightWallHolds;
        const isLeftWall = wall === 'left';

        // Stop any existing tweens on this wall and its holds
        this.tweens.killTweensOf(targetWall);
        this.tweens.killTweensOf(targetHolds);

        // Create smooth movement tween to top for wall
        this.tweens.add({
            targets: targetWall,
            y: this.wallMaxY,
            duration: 1000, // 1 second duration
            ease: 'Power2', // Smooth easing function
            onComplete: () => {
                // Reset movement state
                if (isLeftWall) {
                    this.leftWallMoving = false;
                } else {
                    this.rightWallMoving = false;
                }
            }
        });

        // Create smooth movement tween for holds
        this.tweens.add({
            targets: targetHolds,
            y: this.wallMaxY,
            duration: 1000,
            ease: 'Power2'
        });

        // Set movement state
        if (isLeftWall) {
            this.leftWallMoving = true;
        } else {
            this.rightWallMoving = true;
        }
    }

    createNameEntryWindow() {
        // Create a semi-transparent background
        const overlay = this.add.rectangle(720, 480, 1440, 960, 0x000000, 0.5).setDepth(9);
        const bgCascade = this.add.rectangle(720, 450, 600 + 20, 400 + 20, 0x393939, 1.).setDepth(10);
        const bg = this.add.rectangle(720, 450, 600, 400, 0xffffff, 1.).setDepth(10);

        // Create title
        const titleText = this.add.text(720, 295, 'KEY ASCENT', {
            fontSize: '30px',
            fill: '#393939',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(0.5).setDepth(10);

        // Create input boxes
        const inputLabelStyle = {
            fontSize: '22px',
            fill: '#393939',
            fontFamily: 'PPFraktionSans',
            // backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        };
        const inputBoxStyle = {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'PPFraktionSans',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        };

        // Player 1 input
        const player1Label = this.add.text(720, 365, 'Enter Player 1 Name:', inputLabelStyle).setOrigin(0.5, 0.5).setDepth(10);
        const player1Input = this.add.text(720, 410, this.player1Name, inputBoxStyle)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .setDepth(10);

        // Player 2 input
        const player2Label = this.add.text(720, 465, 'Enter Player 2 Name:', inputLabelStyle).setOrigin(0.5, 0.5).setDepth(10);
        const player2Input = this.add.text(720, 510, this.player2Name, inputBoxStyle)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .setDepth(10);

        // Create start button
        const startButtonBg = this.add.rectangle(720, 590, 200, 50, 0xffffff)
            .setStrokeStyle(1, 0x393939)
            .setDepth(10);
        const startButton = this.add.text(720, 590, 'Start Match', {
            fontSize: '22px',
            fill: '#393939',
            fontFamily: 'PPFraktionSans'
        })
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(10);

        // Add hover effects
        [player1Input, player2Input, startButton].forEach(element => {
            element.on('pointerover', () => {
                if (element === startButton) {
                    startButtonBg.setFillStyle(0xf0f0f0);
                } else {
                    element.setBackgroundColor('#444444');
                }
            });
            element.on('pointerout', () => {
                if (element === startButton) {
                    startButtonBg.setFillStyle(0xffffff);
                } else {
                    element.setBackgroundColor('#333333');
                }
            });
        });

        // Handle input clicks
        let activeInput = null;
        [player1Input, player2Input].forEach(input => {
            input.on('pointerdown', () => {
                activeInput = input;
                input.setBackgroundColor('#444444');
                // Clear the input text when clicked
                input.setText('');
            });
        });

        // Handle keyboard input
        this.keyboardListener = this.input.keyboard.on('keydown', (event) => {
            if (activeInput) {
                if (event.key === 'Enter') {
                    activeInput.setBackgroundColor('#333333');
                    activeInput = null;
                } else if (event.key === 'Backspace') {
                    const text = activeInput.text;
                    if (text.length > 0) {
                        activeInput.setText(text.slice(0, -1));
                    }
                } else if (event.key.length === 1) {
                    activeInput.setText(activeInput.text + event.key);
                }
            }
        });

        // Handle start button click
        startButton.on('pointerdown', () => {
            // Update player names
            this.player1Name = player1Input.text;
            this.player2Name = player2Input.text;

            // Update HUD text
            this.player1NameText.setText(this.player1Name.toUpperCase());
            this.player2NameText.setText(this.player2Name.toUpperCase());

            // Remove keyboard listener
            this.input.keyboard.removeListener('keydown', this.keyboardListener);

            // Remove name entry window
            [overlay, bgCascade, bg, titleText, player1Label, player1Input, player2Label, player2Input, startButton, startButtonBg].forEach(element => {
                element.destroy();
            });

            // Create countdown window
            this.createCountdownWindow();
        });
    }

    createCountdownWindow() {
        // Create a semi-transparent background
        // const overlay = this.add.rectangle(720, 480, 1440, 960, 0x000000, 0.5).setDepth(9);
        const bgCascade = this.add.rectangle(720, 450, 400 + 20, 200 + 20, 0x393939, 1.).setDepth(10);
        const bg = this.add.rectangle(720, 450, 400, 200, 0xffffff, 1.).setDepth(10);

        // Create countdown text
        const countdownText = this.add.text(720, 450, '3', {
            fontSize: '72px',
            fill: '#393939',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(0.5).setDepth(10);

        // Store elements to destroy later
        const elements = [bgCascade, bg, countdownText];

        // Countdown sequence
        const countdown = () => {
            if (this.skipCountdown) {
                // If countdown is skipped, start game immediately
                elements.forEach(element => element.destroy());
                this.gameStarted = true;
                this.startTime = Date.now();
                return;
            }

            let count = 3;
            const updateCountdown = () => {
                if (count > 0) {
                    countdownText.setText(count.toString());
                    count--;
                    this.time.delayedCall(1000, updateCountdown);
                } else {
                    countdownText.setText('GO!');
                    this.time.delayedCall(500, () => {
                        elements.forEach(element => element.destroy());
                        this.gameStarted = true;
                        this.startTime = Date.now();
                    });
                }
            };
            updateCountdown();
        };

        // Start countdown after a short delay
        this.time.delayedCall(500, countdown);
    }

    update() {
        // Only update timer if game has started
        if (this.gameStarted) {
            // Update timer
            const elapsedTime = (Date.now() - this.startTime) / 1000;
            const minutes = Math.floor(elapsedTime / 60);
            const seconds = Math.floor(elapsedTime % 60);
            const milliseconds = Math.floor((elapsedTime % 1) * 1000);
            const timeString = `${minutes}\'${seconds.toString().padStart(2, '0')}"${milliseconds.toString().padStart(3, '0')}`;

            this.player1TickerText.setText(timeString);
            this.player2TickerText.setText(timeString);
        }
    }

    handlePlayerFall(player) {
        // Handle player falling and reset
        // This will be implemented later with actual fall mechanics
    }

    handlePlayerWin(player) {
        // Handle player reaching the top
        // This will be implemented later with actual win mechanics
    }
} 