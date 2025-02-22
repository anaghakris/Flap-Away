class BaseBackground {
    constructor(game, level, assets) {
        this.game = game;
        this.level = level;
        
        this.image = ASSET_MANAGER.getAsset(assets.background);
        this.base = ASSET_MANAGER.getAsset(assets.base);
        this.pipeSprite = ASSET_MANAGER.getAsset(assets.pipe);
        this.topPipeSprite = ASSET_MANAGER.getAsset(assets.topPipe);
        this.coin = ASSET_MANAGER.getAsset("./Sprites/Background/coin.png");
        
        this.snappingPlantSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/SnappingPlant.png");
        this.snappingPlantTop = ASSET_MANAGER.getAsset("./Sprites/Pipes/snapping plants top.png");
        this.enemyBigBirdSprite = ASSET_MANAGER.getAsset("./Sprites/Bird/evil_bird.png");

        this.setupSounds();
        
        this.initializeProperties();
        
        this.setupGameState();
        
        this.coinProgress = new CoinProgress(game, this.width, level === 1 ? 2 : 8);
        
        this.scoreManager = new ScoreManager(this.game);
    }

    setupSounds() {
        this.hitSound = ASSET_MANAGER.getAsset("./audio/sfx_hit.wav");
        this.hitSound.volume = 0.6;
        this.coinSound = ASSET_MANAGER.getAsset("./audio/coin.wav");
        this.coinSound.volume = 0.4;
        this.plantChompSound = ASSET_MANAGER.getAsset("./audio/piranhaPlant.wav");
        this.plantChompSound.volume = 0.35;
        this.swooshSound = ASSET_MANAGER.getAsset("./audio/sfx_swooshing.wav");
        this.lastSoundTime = 0;
        this.MIN_SOUND_INTERVAL = 150;
    }

    initializeProperties() {
        this.width = 800;
        this.height = 600;
        this.baseHeight = 70;
        this.baseY = this.height - this.baseHeight;

        this.pipeWidth = 80;
        this.pipeHeight = 200;
        this.pipeSpeed = 5;
        this.pipeSpacing = 200;
        this.pipeInterval = 2000;

        // snap and non snap
        this.minOpeningRegular = 140;  //100
        this.maxOpeningRegular = 200;  //200
        this.minOpeningSnapping = 140; //130
        this.maxOpeningSnapping = 200; //200

        // old code
        // this.minOpening = 140;
        // this.maxOpening = 200;

        this.snappingPlantFrameWidth = 158;
        this.snappingPlantFrameHeight = 250;
        this.snappingPlantTopFrameHeight = 90;
        this.snappingPlantFrameCount = 6;
        this.snappingPlantFrameDuration = 0.3;
        this.snappingPlantScale = 0.3;

        this.BIRD_WIDTH = 34 * 0.7;
        this.BIRD_HEIGHT = 70 * 0.7;
        this.BIRD_X_OFFSET = 10;
        this.PIPE_HORIZONTAL_PADDING = 8;
        this.PIPE_VERTICAL_PADDING = 10;

        this.enemyBigBirdSpeed = 12;
        this.enemyBigBirdFrameCount = 5;
        this.enemyBigBirdFrameDuration = 0.1;

        this.PLANT_COLLISION_STATES = {
            IDLE: { widthFactor: 0.5, heightFactor: 0.4 },
            SNAPPING: { widthFactor: 0.6, heightFactor: 0.6 }
        };
    }

    setupGameState() {
        this.pipeArray = [];
        this.snappingPlants = [];
        this.coins = [];
        this.enemyBigBirds = [];

        this.gameStarted = false;
        this.hasCollided = false;
        this.pipePairCount = 0;
        
        this.dangerDisplayTime = 0;
        this.DANGER_DURATION = 1.0;
        this.evilWaveActive = false;
        this.evilWaveTriggered = false;
        this.EVIL_WAVE_PIPE_COUNT = 27;
        this.evilWaveBirdsSpawned = 0;
        
        this.levelPassedMessageDuration = 3;
        this.levelPassedMessageTime = 0;
        this.postEvilWaveDelay = 4;
        this.postEvilWaveDelayTimer = 0;
        this.flashTimer = 0;
        this.FLASH_DURATION = 1.0;

        this.setupPipeSpawning();
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

        this.dangerDisplayTime = 0;
        this.evilWaveActive = false;
        this.evilWaveTriggered = false;
        this.evilWaveBirdsSpawned = 0;
        this.enemyBigBirds = [];

        if (this.pipeSpawnInterval) {
            clearInterval(this.pipeSpawnInterval);
        }
        if (this.evilWaveInterval) {
            clearInterval(this.evilWaveInterval);
        }

        this.setupPipeSpawning();
        this.coinProgress.reset();

        this.levelPassedMessageTime = 0;
        this.postEvilWaveDelayTimer = 0;
        this.flashTimer = 0;
    }

    startGame() {
        this.gameStarted = true;
        this.dangerDisplayTime = 0;
        this.enemyBigBirds = [];
        this.evilWaveActive = false;
        this.evilWaveTriggered = false;
        this.evilWaveBirdsSpawned = 0;

        this.game.entities.forEach(entity => {
            if (entity instanceof Bird) {
                entity.startGame();
            }
        });
    }

    setupPipeSpawning() {
        if (this.pipeSpawnInterval) {
            clearInterval(this.pipeSpawnInterval);
        }
        this.pipeSpawnInterval = setInterval(() => {
            if (this.gameStarted && !this.game.gameOver && !this.evilWaveActive && this.postEvilWaveDelayTimer <= 0) {
                this.spawnPipePair();
            }
        }, this.pipeInterval);
    }

    spawnPipePair() {
        if (!this.gameStarted || this.game.gameOver || this.evilWaveActive || this.postEvilWaveDelayTimer > 0)
            return;
        const hasSnappingPlant = this.pipePairCount % 2 === 0;
        let minOpening = hasSnappingPlant ? this.minOpeningSnapping : this.minOpeningRegular;
        let maxOpening = hasSnappingPlant ? this.maxOpeningSnapping : this.maxOpeningRegular;
        const opening = minOpening + Math.random() * (maxOpening - minOpening);
        const minTopPipeHeight = 50;
        const maxTopPipeHeight = this.baseY - opening - 100;
        const topPipeHeight = minTopPipeHeight + Math.random() * (maxTopPipeHeight - minTopPipeHeight);
        const topPipe = {
            x: this.width,
            y: 0,
            width: this.pipeWidth,
            height: topPipeHeight,
            type: 'top',
            passed: false,
            isMoving: false,
            movingTime: 0,
            originalTopHeight: topPipeHeight,
            originalOpening: opening
        };
        const bottomPipe = {
            x: this.width,
            y: topPipeHeight + opening,
            width: this.pipeWidth,
            height: this.baseY - (topPipeHeight + opening),
            type: 'bottom',
            passed: false,
            isMoving: false,
            movingTime: 0,
            originalY: topPipeHeight + opening
        };
        this.pipeArray.push(topPipe, bottomPipe);
        const minDistanceFromPipe = 100;
        const coinX = topPipe.x + this.pipeWidth + minDistanceFromPipe + Math.random() * this.pipeWidth;
        const maxY = this.baseY - 50;
        const minY = 50;
        const coinY = minY + Math.random() * (maxY - minY);
        this.coins.push(new Coin(this.game, coinX, coinY, this.pipeSpeed, this.coinSound));
        const plantWidth = this.snappingPlantFrameWidth * this.snappingPlantScale;
        if (this.level === 2 || this.pipePairCount % 2 === 0) {
            if (Math.random() < 0.5) {
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
                topPipe.hasPlant = true;
            } else {
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
        if (!this.evilWaveTriggered && this.pipePairCount === this.EVIL_WAVE_PIPE_COUNT) {
            this.triggerEvilWave();
            this.postEvilWaveDelayTimer = this.postEvilWaveDelay;
        }
    }
    
    spawnEnemyBigBird() {
        const enemyWidth = this.BIRD_WIDTH * 3;
        const enemyHeight = this.BIRD_HEIGHT * 2;
        
        // Create more random vertical positions
        const minY = 50;
        const maxY = this.baseY - enemyHeight - 150;
        const y = minY + Math.random() * (maxY - minY);
        
        // Space birds based on how many have been spawned
        const baseSpacing = 300; // Base horizontal spacing between birds
        const x = this.width + (this.evilWaveBirdsSpawned * baseSpacing);
        
        const enemyBigBird = {
            x: x,
            y: y,
            width: enemyWidth,
            height: enemyHeight,
            elapsedTime: 0,
            verticalSpeed: (Math.random() - 0.5) * 1.5,
            verticalRange: 80,
            originalY: y
        };
        
        this.enemyBigBirds.push(enemyBigBird);
        this.dangerDisplayTime = this.DANGER_DURATION;
    }
    
    triggerEvilWave() {
        this.evilWaveActive = true;
        this.evilWaveTriggered = true;
        this.pipeArray = [];
        this.snappingPlants = [];
        this.coins = [];
        clearInterval(this.pipeSpawnInterval);
        this.pipeSpawnInterval = null;
        this.evilWaveBirdsSpawned = 0;
        
        // Initial bird spawn
        this.spawnEnemyBigBird();
        this.evilWaveBirdsSpawned++;
        
        // Spawn remaining birds with consistent timing but maintained spacing
        const spawnNextBird = () => {
            if (this.evilWaveBirdsSpawned < 4) {
                setTimeout(() => {
                    this.spawnEnemyBigBird();
                    this.evilWaveBirdsSpawned++;
                    spawnNextBird();
                }, 1000); // Consistent 1-second timing
            }
        };
        
        spawnNextBird();
    }
    
    update() {
        if (!this.gameStarted || this.game.gameOver) return;
    
        if (this.dangerDisplayTime > 0) {
            this.dangerDisplayTime -= this.game.clockTick;
        }
    
        // Update enemy birds movement
        for (let bird of this.enemyBigBirds) {
            if (bird.verticalSpeed) {
                bird.y += bird.verticalSpeed;
                
                const distanceFromOriginal = Math.abs(bird.y - bird.originalY);
                if (distanceFromOriginal > bird.verticalRange) {
                    bird.verticalSpeed *= -1;
                }
                
                const minY = 50;
                const maxY = this.baseY - bird.height - 100;
                if (bird.y < minY || bird.y > maxY) {
                    bird.verticalSpeed *= -1;
                    bird.y = bird.y < minY ? minY : maxY;
                }
            }
        }
    
        // Rest of your existing update logic
        if (this.evilWaveActive &&
            this.evilWaveBirdsSpawned === 4 &&
            this.enemyBigBirds.length === 0 &&
            this.dangerDisplayTime <= 0) {
            this.evilWaveActive = false;
            this.levelPassedMessageTime = this.levelPassedMessageDuration;
            this.postEvilWaveDelayTimer = this.postEvilWaveDelay;
        }
    
        if (this.levelPassedMessageTime > 0) {
            this.levelPassedMessageTime -= this.game.clockTick;
            if (this.levelPassedMessageTime <= 0 && this.level === 1) {
                this.flashTimer = this.FLASH_DURATION;
            }
        }
    
        if (this.flashTimer > 0) {
            this.flashTimer -= this.game.clockTick;
            if (this.flashTimer <= 0 && this.level === 1) {
                this.transitionToLevel2();
                return;
            }
            return;
        }
    
        if (this.postEvilWaveDelayTimer > 0) {
            this.postEvilWaveDelayTimer -= this.game.clockTick;
            return;
        }
    
        if (!this.evilWaveActive && !this.pipeSpawnInterval) {
            this.setupPipeSpawning();
        }
    
        this.updateGameObjects();
        this.handleCollisions();
    }
    updateGameObjects() {
        if (!this.evilWaveActive) {
            this.pipeArray.forEach(pipe => {
                pipe.x -= this.pipeSpeed;
            });
        }

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
        });

        this.coins.forEach(coin => {
            coin.update();
        });

        this.enemyBigBirds.forEach(enemy => {
            enemy.x -= this.enemyBigBirdSpeed;
            enemy.elapsedTime += this.game.clockTick;
        });

        this.pipeArray = this.pipeArray.filter(pipe => pipe.x + pipe.width > 0);
        this.snappingPlants = this.snappingPlants.filter(plant => {
            const isOnScreen = plant.x + (this.snappingPlantFrameWidth * this.snappingPlantScale) > 0;
            const hasCompletedAnimation = plant.elapsedTime >= this.snappingPlantFrameDuration * this.snappingPlantFrameCount;
            return isOnScreen && !hasCompletedAnimation;
        });
        this.coins = this.coins.filter(coin => !coin.collected && coin.x + 50 > 0);
        this.enemyBigBirds = this.enemyBigBirds.filter(enemy => enemy.x + enemy.width > 0);
    }

    handleCollisions() {
        const bird = this.getBird();
        if (!bird) return;

        this.pipeArray.forEach(pipe => {
            this.scoreManager.updateScore(bird, pipe);
        });

        if (!bird.invincible) {
            for (const pipe of this.pipeArray) {
                if (this.checkPipeCollision(bird, pipe)) {
                    this.handleCollision(bird);
                    break;
                }
            }

            for (const plant of this.snappingPlants) {
                if (this.checkPlantCollision(bird, plant)) {
                    this.handleCollision(bird);
                    break;
                }
            }

            this.enemyBigBirds.forEach(enemy => {
                if (this.checkEnemyBigBirdCollision(bird, enemy)) {
                    this.handleCollision(bird);
                }
            });
        }

        this.coins.forEach(coin => {
            if (!coin.collected && coin.checkCollision(bird)) {
                coin.collected = true;
                this.coinProgress.collectCoin();
                if (this.coinProgress.coinsCollected >= this.coinProgress.maxCoins) {
                    bird.invincible = true;
                    bird.invincibleTimer = 10;
                    this.coinProgress.reset();
                }
            }
        });
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

    handleCollision(bird) {
        this.playSound(this.hitSound);
        if (this.swooshSound) {
            this.swooshSound.currentTime = 0;
            this.swooshSound.play();
        }
        this.game.gameOver = true;
        this.game.hasCollided = true;
        bird.velocity = 0;
        bird.rotation = bird.maxRotationDown;
        this.scoreManager.updateBestScore(bird.score);
    }

    getBird() {
        return this.game.entities.find(entity => entity instanceof Bird) || null;
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

        const frameWidth = 250;
        const frameHeight = 202;
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

        if (this.levelPassedMessageTime > 0 && !this.game.gameOver && this.gameStarted) {
            const alpha = Math.min(1, this.levelPassedMessageTime * 2);
            const pulse = Math.sin(Date.now() / 100) * 0.3 + 1;
            ctx.save();
            ctx.translate(this.width / 2, this.height / 3);
            ctx.scale(pulse, pulse);
            ctx.fillStyle = `rgba(50, 255, 50, ${alpha})`;
            ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.lineWidth = 4;
            ctx.font = '60px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeText(`LEVEL ${this.level} PASSED!`, 0, 0);
            ctx.fillText(`LEVEL ${this.level} PASSED!`, 0, 0);
            ctx.restore();
        } else if (this.dangerDisplayTime > 0 && !this.game.gameOver && this.gameStarted) {
            const alpha = Math.min(1, this.dangerDisplayTime * 2);
            const pulse = Math.sin(Date.now() / 100) * 0.3 + 1;
            ctx.save();
            ctx.translate(this.width / 2, this.height / 3);
            ctx.scale(pulse, pulse);
            ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
            ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.lineWidth = 4;
            ctx.font = '60px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeText('DANGER!', 0, 0);
            ctx.fillText('DANGER!', 0, 0);
            ctx.restore();
        }

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
            const bestScore = this.scoreManager.getBestScore();
            ctx.fillText(bestScore.toString(), panelX + panelWidth / 2, panelY + 150);

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