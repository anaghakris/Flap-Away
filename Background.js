class Background {
    constructor(game) {
        this.game = game;
        this.image = ASSET_MANAGER.getAsset("./Sprites/Background/Daytime.png");
        this.coin = ASSET_MANAGER.getAsset("./Sprites/Background/coin.png");
        this.base = ASSET_MANAGER.getAsset("./Sprites/Background/base.png");
        this.pipeSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/bottom pipe.png");
        this.topPipeSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/bottom pipe.png");
        this.snappingPlantSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/SnappingPlant.png");
        this.snappingPlantTop = ASSET_MANAGER.getAsset("./Sprites/Pipes/snapping plants top.png");

        this.pointSound = ASSET_MANAGER.getAsset("./audio/sfx_point.wav");
        this.pointSound.volume = 0.3; 

        this.hitSound = ASSET_MANAGER.getAsset("./audio/sfx_hit.wav");
        this.hitSound.volume = 0.6;    

        this.coinSound = ASSET_MANAGER.getAsset("./audio/coin.wav");
        this.coinSound.volume = 0.4;  

        this.plantChompSound = ASSET_MANAGER.getAsset("./audio/piranhaPlant.wav");
        this.plantChompSound.volume = 0.35; 

        this.swooshSound = ASSET_MANAGER.getAsset("./audio/sfx_swooshing.wav");
        this.hasCollided = false;
        
        this.lastSoundTime = 0;       
        this.MIN_SOUND_INTERVAL = 150; 

        this.width = 800;
        this.height = 600;
        this.baseHeight = 70;
        this.baseY = this.height - this.baseHeight;

        this.pipeWidth = 80;
        this.pipeHeight = 200;
        this.pipeArray = [];
        this.snappingPlants = [];
        this.coins = [];
        this.pipeSpeed = 5;
        this.pipeSpacing = 200;
        this.pipeInterval = 2000;

        this.snappingPlantFrameWidth = 158;
        this.snappingPlantFrameHeight = 250;
        this.snappingPlantTopFrameHeight = 90;
        this.snappingPlantFrameCount = 6;
        this.snappingPlantFrameDuration = 0.3;
        this.snappingPlantScale = 0.3;

        this.gameStarted = false;
        this.pipePairCount = 0;
        this.pipeSpawnInterval = null;
        this.setupPipeSpawning();

        // Bird & pipe collision parameters
        this.BIRD_WIDTH = 34 * 0.7;
        this.BIRD_HEIGHT = 70 * 0.7;
        this.BIRD_X_OFFSET = 10;
        this.PIPE_HORIZONTAL_PADDING = 8;
        this.PIPE_VERTICAL_PADDING = 10;

        this.PLANT_COLLISION_STATES = {
            IDLE: { widthFactor: 0.5, heightFactor: 0.4 },
            SNAPPING: { widthFactor: 0.6, heightFactor: 0.6 }
        };

        // Create coin progress with maxCoins set to 3
        this.coinProgress = new CoinProgress(game, this.width, 3);

        this.enemyBigBirdSprite = ASSET_MANAGER.getAsset("./Sprites/Bird/evil_bird.png");
        this.enemyBigBirds = [];
        this.enemyBigBirdSpeed = 12;
        this.enemyBigBirdFrameCount = 5;
        this.enemyBigBirdFrameDuration = 0.1; 

        this.enemyBigBirdInterval = setInterval(() => {
            if (this.gameStarted && !this.game.gameOver) {
                const hasPlantOnScreen = this.pipeArray.some(pipe => 
                    pipe.hasPlant && 
                    pipe.x + pipe.width > 0 && 
                    pipe.x < this.width
                );
                if (!hasPlantOnScreen) {
                    this.spawnEnemyBigBird();
                }
            }
        }, 3000);
    }

    playSound(sound) {
        const currentTime = Date.now();
        if (currentTime - this.lastSoundTime >= this.MIN_SOUND_INTERVAL) {
            sound.currentTime = 0;
            sound.play();
            this.lastSoundTime = currentTime;
        }
    }

    reset() {
        this.pipeArray = [];
        this.snappingPlants = [];
        this.coins = [];
        this.gameStarted = false;
        this.pipePairCount = 0;
        this.hasCollided = false;

        if (this.pipeSpawnInterval) {
            clearInterval(this.pipeSpawnInterval);
        }
        this.setupPipeSpawning();
        this.coinProgress.reset();

        // Reset enemy big birds
        this.enemyBigBirds = [];
    }

    startGame() {
        this.gameStarted = true;
        this.game.entities.forEach(entity => {
            if (entity instanceof Bird) {
                entity.startGame();
            }
        });
    }

    setupPipeSpawning() {
        this.pipeSpawnInterval = setInterval(() => {
            if (this.gameStarted && !this.game.gameOver) {
                this.spawnPipePair();
            }
        }, this.pipeInterval);
    }

    spawnPipePair() {
        if (!this.gameStarted || this.game.gameOver) return;

        const opening = 150;
        const minTopPipeHeight = 50;
        const maxTopPipeHeight = this.baseY - opening - 100;
        const topPipeHeight = minTopPipeHeight + Math.random() * (maxTopPipeHeight - minTopPipeHeight);

        const topPipe = {
            x: this.width,
            y: 0,
            width: this.pipeWidth,
            height: topPipeHeight,
            type: 'top',
            passed: false
        };

        const bottomPipe = {
            x: this.width,
            y: topPipeHeight + opening,
            width: this.pipeWidth,
            height: this.baseY - (topPipeHeight + opening),
            type: 'bottom',
            passed: false
        };

        this.pipeArray.push(topPipe, bottomPipe);

        const minDistanceFromPipe = 100;
        const coinX = topPipe.x + this.pipeWidth + minDistanceFromPipe + Math.random() * (this.pipeWidth);
        const maxY = this.baseY - 50;
        const minY = 50;
        const coinY = minY + Math.random() * (maxY - minY);

        this.coins.push(new Coin(this.game, coinX, coinY, this.pipeSpeed, this.coinSound));

        if (this.pipePairCount % 2 === 0) {
            const addTopPlant = Math.random() < 0.5;

            if (addTopPlant) {
                const plantWidth = this.snappingPlantFrameWidth * this.snappingPlantScale;
                const topPlantX = this.width + (this.pipeWidth - plantWidth) / 2;
                const topPlantY = topPipeHeight - this.snappingPlantTopFrameHeight * this.snappingPlantScale + 20;

                this.snappingPlants.push({
                    x: topPlantX,
                    y: topPlantY,
                    elapsedTime: 0,
                    type: "top",
                    state: "IDLE",
                    lastFrame: -1
                });

                // Mark the top pipe as having a plant
                topPipe.hasPlant = true;
            } else {
                const plantWidth = this.snappingPlantFrameWidth * this.snappingPlantScale;
                const bottomPlantX = this.width + (this.pipeWidth - plantWidth) / 2;
                const bottomPlantY = bottomPipe.y - (this.snappingPlantFrameHeight * this.snappingPlantScale);

                this.snappingPlants.push({
                    x: bottomPlantX,
                    y: bottomPlantY,
                    elapsedTime: 0,
                    type: "bottom",
                    state: "IDLE",
                    lastFrame: -1
                });

                bottomPipe.hasPlant = true;
            }
        }

        this.pipePairCount++;
    }

    spawnEnemyBigBird() {
        const enemyWidth = this.BIRD_WIDTH * 3;
        const enemyHeight = this.BIRD_HEIGHT * 2;
        const x = this.width;
        const y = 100;
        let enemyBigBird = {
            x: x,
            y: y,
            width: enemyWidth,
            height: enemyHeight,
            elapsedTime: 0 
        };
        this.enemyBigBirds.push(enemyBigBird);
    }

    update() {
        if (!this.gameStarted || this.game.gameOver) return;

        this.pipeArray.forEach(pipe => {
            pipe.x -= this.pipeSpeed;
        });

        this.snappingPlants.forEach(plant => {
            plant.x -= this.pipeSpeed;
            plant.elapsedTime += this.game.clockTick;
            const frame = Math.floor(plant.elapsedTime / this.snappingPlantFrameDuration) % this.snappingPlantFrameCount;
            if (frame === 3 && plant.lastFrame !== 3) {
                this.playSound(this.plantChompSound);
            }
            plant.lastFrame = frame;
            if (frame === this.snappingPlantFrameCount - 1) {
                plant.elapsedTime = 0;
            }
            this.snappingPlantFrameDuration = 0.3;
        });

        // Update coins
        this.coins.forEach(coin => {
            coin.update();
        });

        const bird = this.getBird();
        if (bird) {
            // Increase score for passing pipes regardless of invincibility
            this.pipeArray.forEach(pipe => {
                if (!pipe.passed && bird.x > pipe.x + pipe.width && pipe.type === 'top') {
                    pipe.passed = true;
                    bird.score++;
                    this.playSound(this.pointSound);
                }
            });

            // Only perform collision checks if the bird is not invincible
            if (!bird.invincible) {
                // Check collisions with pipes
                for (const pipe of this.pipeArray) {
                    if (this.checkPipeCollision(bird, pipe)) {
                        this.playSound(this.hitSound);
                        if (this.swooshSound) {
                            this.swooshSound.currentTime = 0;
                            this.swooshSound.play();
                        }
                        this.game.gameOver = true;
                        this.game.hasCollided = true;
                        bird.velocity = 0;
                        bird.rotation = bird.maxRotationDown;
                        const currentScore = bird.score;
                        const bestScore = parseInt(localStorage.getItem('bestScore') || '0');
                        if (currentScore > bestScore) {
                            localStorage.setItem('bestScore', currentScore.toString());
                        }
                        break;
                    }
                }

                // Check collisions with snapping plants
                for (const plant of this.snappingPlants) {
                    if (this.checkPlantCollision(bird, plant)) {
                        this.playSound(this.hitSound);
                        if (this.swooshSound) {
                            this.swooshSound.currentTime = 0;
                            this.swooshSound.play();
                        }
                        this.game.gameOver = true;
                        this.game.hasCollided = true;
                        bird.velocity = 0;
                        bird.rotation = bird.maxRotationDown;
                        const currentScore = bird.score;
                        const bestScore = parseInt(localStorage.getItem('bestScore') || '0');
                        if (currentScore > bestScore) {
                            localStorage.setItem('bestScore', currentScore.toString());
                        }
                        break;
                    }
                }

                // Check collisions with the enemy big bird(s)
                this.enemyBigBirds.forEach(enemy => {
                    if (this.checkEnemyBigBirdCollision(bird, enemy)) {
                        this.playSound(this.hitSound);
                        if (this.swooshSound) {
                            this.swooshSound.currentTime = 0;
                            this.swooshSound.play();
                        }
                        this.game.gameOver = true;
                        this.game.hasCollided = true;
                        bird.velocity = 0;
                        bird.rotation = bird.maxRotationDown;
                        const currentScore = bird.score;
                        const bestScore = parseInt(localStorage.getItem('bestScore') || '0');
                        if (currentScore > bestScore) {
                            localStorage.setItem('bestScore', currentScore.toString());
                        }
                    }
                });
            }

            // Check collisions with coins (always allow coin collection)
            this.coins.forEach(coin => {
                if (!coin.collected && coin.checkCollision(bird)) {
                    coin.collected = true;
                    this.coinProgress.collectCoin();

                    // --- NEW: If coin progress reaches max (3 coins), trigger invincibility ---
                    if (this.coinProgress.coinsCollected >= this.coinProgress.maxCoins) {
                        bird.invincible = true;
                        bird.invincibleTimer = 10; // 10 seconds of invincibility
                        this.coinProgress.reset(); // reset coin progress if desired
                    }
                }
            });
        }

        // Clean up off-screen elements
        this.pipeArray = this.pipeArray.filter(pipe => pipe.x + pipe.width > 0);
        this.snappingPlants = this.snappingPlants.filter(plant => {
            const isOnScreen = plant.x + (this.snappingPlantFrameWidth * this.snappingPlantScale) > 0;
            const hasCompletedAnimation = plant.elapsedTime >= 0 &&
                plant.elapsedTime > this.snappingPlantFrameDuration * this.snappingPlantFrameCount;
            return isOnScreen && !hasCompletedAnimation;
        });
        this.coins = this.coins.filter(coin => !coin.collected && coin.x + 50 > 0);

        // Update enemy big birds: move them left and update their animation timer
        this.enemyBigBirds.forEach(enemy => {
            enemy.x -= this.enemyBigBirdSpeed;
            enemy.elapsedTime += this.game.clockTick;
        });
        this.enemyBigBirds = this.enemyBigBirds.filter(enemy => enemy.x + enemy.width > 0);
    }

    getBird() {
        return this.game.entities.find(entity => entity instanceof Bird) || null;
    }

    checkPipeCollision(bird, pipe) {
        const birdLeft = bird.x + this.BIRD_X_OFFSET;
        const birdRight = birdLeft + this.BIRD_WIDTH;
        const birdTop = bird.y + (70 * 1.2 - this.BIRD_HEIGHT) / 2;
        const birdBottom = birdTop + this.BIRD_HEIGHT;

        const pipeLeft = pipe.x + this.PIPE_HORIZONTAL_PADDING;
        const pipeRight = pipe.x + pipe.width - this.PIPE_HORIZONTAL_PADDING;
        const pipeTop = pipe.y + (pipe.type === 'top' ? this.PIPE_VERTICAL_PADDING : 0);
        const pipeBottom = pipe.y + pipe.height - (pipe.type === 'top' ? 0 : this.PIPE_VERTICAL_PADDING);

        return (
            birdRight > pipeLeft &&
            birdLeft < pipeRight &&
            birdBottom > pipeTop &&
            birdTop < pipeBottom
        );
    }

    checkPlantCollision(bird, plant) {
        if (plant.elapsedTime < 0) return false;

        const frame = Math.floor(plant.elapsedTime / this.snappingPlantFrameDuration) % this.snappingPlantFrameCount;
        plant.state = (frame >= 2 && frame <= 4) ? "SNAPPING" : "IDLE";
        const collisionFactors = this.PLANT_COLLISION_STATES[plant.state];

        const birdLeft = bird.x + this.BIRD_X_OFFSET;
        const birdRight = birdLeft + this.BIRD_WIDTH;
        const birdTop = bird.y + (70 * 1.2 - this.BIRD_HEIGHT) / 2;
        const birdBottom = birdTop + this.BIRD_HEIGHT;

        const plantScale = this.snappingPlantScale;
        const collisionWidth = this.snappingPlantFrameWidth * plantScale * collisionFactors.widthFactor;
        const collisionHeight = this.snappingPlantFrameHeight * plantScale * collisionFactors.heightFactor;

        let plantCollisionX = plant.x + (this.snappingPlantFrameWidth * plantScale - collisionWidth) / 2;
        let plantCollisionY;

        if (plant.type === "top") {
            if (plant.state === "SNAPPING") {
                plantCollisionY = plant.y + this.snappingPlantTopFrameHeight * plantScale;
            } else {
                plantCollisionY = plant.y + this.snappingPlantTopFrameHeight * plantScale - collisionHeight;
            }
        } else {
            plantCollisionY = plant.y + (this.snappingPlantFrameHeight * plantScale - collisionHeight) * (plant.state === "SNAPPING" ? 0.9 : 0.8);
        }

        return (
            birdRight > plantCollisionX &&
            birdLeft < plantCollisionX + collisionWidth &&
            birdBottom > plantCollisionY &&
            birdTop < plantCollisionY + collisionHeight
        );
    }

    // === NEW: Collision check for the enemy big bird ===
    checkEnemyBigBirdCollision(bird, enemy) {
        const birdLeft = bird.x + this.BIRD_X_OFFSET;
        const birdRight = birdLeft + this.BIRD_WIDTH;
        const birdTop = bird.y + (70 * 1.2 - this.BIRD_HEIGHT) / 2;
        const birdBottom = birdTop + this.BIRD_HEIGHT;

        const enemyLeft = enemy.x;
        const enemyRight = enemy.x + enemy.width;
        const enemyTop = enemy.y;
        const enemyBottom = enemy.y + enemy.height;

        return (
            birdRight > enemyLeft &&
            birdLeft < enemyRight &&
            birdBottom > enemyTop &&
            birdTop < enemyBottom
        );
    }

    draw(ctx) {
        ctx.drawImage(this.image, 0, 0, this.width, this.height);

        this.pipeArray.forEach(pipe => {
            if (pipe.type === 'top') {
                ctx.save();
                ctx.translate(pipe.x + pipe.width / 2, pipe.y + pipe.height);
                ctx.rotate(Math.PI);
                ctx.drawImage(
                    this.topPipeSprite,
                    0, 0, 55, 200,
                    -pipe.width / 2, 0, pipe.width, pipe.height
                );
                ctx.restore();
            } else {
                ctx.drawImage(
                    this.pipeSprite,
                    0, 0, 55, 200,
                    pipe.x, pipe.y, pipe.width, pipe.height
                );
            }
        });

        this.coins.forEach(coin => {
            coin.draw(ctx);
        });

        this.snappingPlants.forEach(plant => {
            if (plant.elapsedTime < 0) return;
            const frame = Math.floor(plant.elapsedTime / this.snappingPlantFrameDuration) % this.snappingPlantFrameCount;
            const sprite = plant.type === "bottom" ? this.snappingPlantSprite : this.snappingPlantTop;
            ctx.drawImage(
                sprite,
                frame * this.snappingPlantFrameWidth, 0,
                this.snappingPlantFrameWidth, this.snappingPlantFrameHeight,
                plant.x, plant.y,
                this.snappingPlantFrameWidth * this.snappingPlantScale,
                this.snappingPlantFrameHeight * this.snappingPlantScale
            );
        });

        // === NEW: Draw the animated enemy big bird(s) ===
        const frameWidth = 250; // Adjusted frame width for enemy bird
        const frameHeight = 202; // Frame height remains the same
        this.enemyBigBirds.forEach(enemy => {
            const frameIndex = Math.floor(enemy.elapsedTime / this.enemyBigBirdFrameDuration) % this.enemyBigBirdFrameCount;
            ctx.drawImage(
                this.enemyBigBirdSprite,
                frameIndex * frameWidth, 0, frameWidth, frameHeight,
                enemy.x, enemy.y, enemy.width, enemy.height
            );
        });

        ctx.drawImage(this.base, 0, this.baseY, this.width, this.baseHeight);
        this.coinProgress.draw(ctx);

        if (this.game.gameOver) {
            const colors = this.coinProgress.colors;
            const panelWidth = 180; 
            const panelHeight = 160; 
            const panelX = (this.width - panelWidth) / 2;
            const panelY = (this.height - panelHeight) / 2 - 50;

            ctx.fillStyle = colors.background;
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(panelX + 10, panelY);
            ctx.lineTo(panelX + panelWidth - 10, panelY);
            ctx.quadraticCurveTo(panelX + panelWidth, panelY, panelX + panelWidth, panelY + 10);
            ctx.lineTo(panelX + panelWidth, panelY + panelHeight - 10);
            ctx.quadraticCurveTo(panelX + panelWidth, panelY + panelHeight, panelX + panelWidth - 10, panelY + panelHeight);
            ctx.lineTo(panelX + 10, panelY + panelHeight);
            ctx.quadraticCurveTo(panelX, panelY + panelHeight, panelX, panelY + panelHeight - 10);
            ctx.lineTo(panelX, panelY + 10);
            ctx.quadraticCurveTo(panelX, panelY, panelX + 10, panelY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.font = '18px "Press Start 2P", monospace'; 
            ctx.fillStyle = colors.title.main;
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', panelX + panelWidth / 2, panelY + 30);

            ctx.font = '16px "Press Start 2P", monospace'; 
            ctx.fillStyle = colors.title.main;
            ctx.fillText('SCORE', panelX + panelWidth / 2, panelY + 60);

            ctx.fillStyle = colors.text;
            ctx.font = '20px "Press Start 2P", monospace'; 
            ctx.fillText(this.getBird()?.score.toString() || '0', panelX + panelWidth / 2, panelY + 90);

            ctx.font = '16px "Press Start 2P", monospace'; 
            ctx.fillStyle = colors.title.main;
            ctx.fillText('BEST', panelX + panelWidth / 2, panelY + 120);

            ctx.fillStyle = colors.text;
            ctx.font = '20px "Press Start 2P", monospace'; 
            const bestScore = localStorage.getItem('bestScore') || '0';
            ctx.fillText(bestScore, panelX + panelWidth / 2, panelY + 150);

            const btnWidth = 120; 
            const btnHeight = 40; 
            const btnX = (this.width - btnWidth) / 2;
            const btnY = panelY + panelHeight + 10; 

            ctx.fillStyle = colors.fill.start;
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(btnX + 10, btnY);
            ctx.lineTo(btnX + btnWidth - 10, btnY);
            ctx.quadraticCurveTo(btnX + btnWidth, btnY, btnX + btnWidth, btnY + 10);
            ctx.lineTo(btnX + btnWidth, btnY + btnHeight - 10);
            ctx.quadraticCurveTo(btnX + btnWidth, btnY + btnHeight, btnX + btnWidth - 10, btnY + btnHeight);
            ctx.lineTo(btnX + 10, btnY + btnHeight);
            ctx.quadraticCurveTo(btnX, btnY + btnHeight, btnX, btnY + btnHeight - 10);
            ctx.lineTo(btnX, btnY + 10);
            ctx.quadraticCurveTo(btnX, btnY, btnX + 10, btnY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.font = '16px "Press Start 2P", monospace'; 
            ctx.fillStyle = colors.text;
            ctx.fillText('RESTART', btnX + btnWidth / 2, btnY + btnHeight / 2 + 8);

            const returnBtnWidth = 240;
            const returnBtnHeight = 40;
            const returnBtnX = (this.width - returnBtnWidth) / 2;
            const returnBtnY = btnY + btnHeight + 10;

            ctx.fillStyle = colors.fill.start;
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(returnBtnX + 10, returnBtnY);
            ctx.lineTo(returnBtnX + returnBtnWidth - 10, returnBtnY);
            ctx.quadraticCurveTo(returnBtnX + returnBtnWidth, returnBtnY, returnBtnX + returnBtnWidth, returnBtnY + 10);
            ctx.lineTo(returnBtnX + returnBtnWidth, returnBtnY + returnBtnHeight - 10);
            ctx.quadraticCurveTo(returnBtnX + returnBtnWidth, returnBtnY + returnBtnHeight, returnBtnX + returnBtnWidth - 10, returnBtnY + returnBtnHeight);
            ctx.lineTo(returnBtnX + 10, returnBtnY + returnBtnHeight);
            ctx.quadraticCurveTo(returnBtnX, returnBtnY + returnBtnHeight, returnBtnX, returnBtnY + returnBtnHeight - 10);
            ctx.lineTo(returnBtnX, returnBtnY + 10);
            ctx.quadraticCurveTo(returnBtnX, returnBtnY, returnBtnX + 10, returnBtnY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.font = '16px "Press Start 2P", monospace'; 
            ctx.fillStyle = colors.text;
            ctx.fillText('RETURN TO MENU', returnBtnX + returnBtnWidth / 2, returnBtnY + returnBtnHeight / 2 + 8);

        } else if (!this.gameStarted) {
            ctx.font = "24px Arial";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.textAlign = "center";
            ctx.strokeText("Press Space to Start", this.width / 2, this.height / 2);
            ctx.fillText("Press Space to Start", this.width / 2, this.height / 2);
        }
    }
}
