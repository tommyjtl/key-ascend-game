Game Design Document (Alpha Version)

Game Title

Speed Climber (Alpha)

Overview

Speed Climber is a competitive 2-player climbing game focusing on reaction time and agility. Players race each other to reach the top of a climbing wall as quickly as possible using keyboard interactions.

Gameplay Mechanics

Controls

* Player 1: Uses the leftmost keys (q, w, e, r, a, s, d, f, z, x, c, v) on a QWERTY keyboard.
* Player 2: Uses the rightmost keys (o, p, [, ], k, l, ;, ', m, ,, ., /) on a QWERTY keyboard.
* Each climbing hold requires interaction with two keys representing the player's left and right hands.
* Key prompts on upcoming holds are randomized from the player's available keys.
* Both keys must be pressed within 1 second of each other; otherwise, the player falls.

Game Progression

* Players begin with two circles (representing hands) at the bottom hold.
* Above the current hold, the next two holds show sliders moving horizontally.
* Sliders indicate which keys players must press:
    * Sliders have a grip zone (central 50%); successful presses within this zone allow players to progress.
    * Presses outside this zone result in a fall and immediate reset to the starting position.
    * Sliders closer to the player move slower; higher sliders move faster.

Failure State

* Players fall upon incorrect timing or exceeding the 1-second interval between key presses.
* Upon falling, players reset immediately to the starting position.

Camera and Visuals

* Two identical climbing walls side-by-side.
* No dynamic camera zoom; split-screen format for player clarity.
* Simple visual representation: circles for hands, sliders for interactions.

User Interface (UI)

* Main menu: only "Start Game" option.
* Name entry prompt before gameplay.
* Heads-Up Display (HUD):
    * Player banners displaying player names and personal best times.
    * Ticker timer displaying elapsed time during climbs.

Win Condition

* First player to successfully reach the top hold wins.
* When one player reaches the top, the other player continues playing until completion or fall.
* A pop-up window announces the winner and provides a "Rematch" button.

Data Persistence

* Players' best times are saved persistently across game sessions.

