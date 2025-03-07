class BaseBackground {
    constructor(game, level, assets) {
        this.game = game;
        this.level = level;
        
        this.image = ASSET_MANAGER.getAsset(assets.background);
        this.base = ASSET_MANAGER.getAsset(assets.base);
        this.pipeSprite = ASSET_MANAGER.getAsset(assets.pipe);
        this.topPipeSprite = ASSET_MANAGER.getAsset(assets.topPipe);
        this.coin = ASSET_MANAGER.getAsset(assets.background);
        this.heartDisplay = new HeartDisplay(game);

        this.snappingPlantSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/SnappingPlant.png");
        this.snappingPlantTop = ASSET_MANAGER.getAsset("./Sprites/Pipes/snapping plants top.png");
        this.enemyBigBirdSprite = ASSET_MANAGER.getAsset("./Sprites/Bird/evil_bird.png");
        
        this.mushroomSprite = ASSET_MANAGER.getAsset("./Sprites/mushrooms/mushroom.png");
        this.initializeMushroomProperties();

        // --- NEW: Enemy Shooter for Level 3 ---
        // This sprite sheet is 1215 x 830 with 5 frames (each frame 1215/5 = 243px wide).
        this.enemyShooterSprite = ASSET_MANAGER.getAsset("./Sprites/Enemy/sprite_sheet.png");
        this.enemyShooterFrameCount = 5;
        this.enemyShooterWidth = 1170;
        this.enemyShooterHeight = 830;
        this.enemyShooterScale = 0.1; // adjust scale as needed
        this.enemyShooterFrameDuration = 0.1;
        this.enemyShooterSpeed = 3; // speed at which it moves rightward
        this.enemyShooters = [];
        this.enemyShooterProjectiles = []; // NEW: Array to store shooter projectiles
        this.setupSounds();
        this.initializeProperties();
        this.setupGameState();
        
        this.coinProgress = new CoinProgress(game, this.width, level === 1 ? 2 : 6);
        this.scoreManager = new ScoreManager(this.game);

        this.health = 3; 
        this.coinsForHeart = 0;

        this.chanceMessage = "";
        this.chanceMessageTimer = 0;
        this.CHANCE_MESSAGE_DURATION = 2.0; 

        // Plant explosions and death handling
        this.plantExplosions = [];
        this.plantDeathSound = ASSET_MANAGER.getAsset("./audio/sfx_hit.wav");
        if (this.plantDeathSound) {
            this.plantDeathSound.volume = 0.4;
        }

    }

    playSound(sound) {
        if (sound) {
            sound.currentTime = 0;
            sound.play();
        }
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
        this.dieSound = ASSET_MANAGER.getAsset("./audio/sfx_die.wav");
        this.dieSound.volume = 0.6;
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

        this.minOpeningRegular = 140;
        this.maxOpeningRegular = 140;
        this.minOpeningSnapping = 170;
        this.maxOpeningSnapping = 200;

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
        this.PIPE_VERTICAL_SPEED = 2;
        this.PIPE_VERTICAL_RANGE = 20;

        this.enemyBigBirdSpeed = 12;
        this.enemyBigBirdFrameCount = 5;
        this.enemyBigBirdFrameDuration = 0.1;

        this.PLANT_COLLISION_STATES = {
            IDLE: { widthFactor: 0.5, heightFactor: 0.4 },
            SNAPPING: { widthFactor: 0.6, heightFactor: 0.6 }
        };

        this.WAVE_PATTERNS = {
            TOP: "top",
            BOTTOM: "bottom",
            RANDOM: "random"
        };
    }


    setupGameState() {
        this.pipeArray = [];
        this.snappingPlants = [];
        this.coins = [];
        this.enemyBigBirds = [];
        this.enemyShooters = [];
        this.coinsForHeart = 0;
        
        this.mushrooms = [];

        this.gameStarted = false;
        this.hasCollided = false;
        this.pipePairCount = 0;
        
        this.dangerDisplayTime = 0;
        this.DANGER_DURATION = 1.0;
        this.evilWaveActive = false;
        this.evilWaveTriggered = false;
        this.EVIL_WAVE_PIPE_COUNT = 17;
        this.evilWaveBirdsSpawned = 0;
        
        this.levelPassedMessageDuration = 3;
        this.levelPassedMessageTime = 0;
        this.postEvilWaveDelay = 4;
        this.postEvilWaveDelayTimer = 0;
        this.flashTimer = 0;
        this.FLASH_DURATION = 1.0;
        
        this.evilWaveTimeouts = [];

        this.setupPipeSpawning();
    }

    initializeMushroomProperties() {
        this.MUSHROOM_FRAME_WIDTH = 400;
        this.MUSHROOM_FRAME_HEIGHT = 335;
        this.MUSHROOM_ANIMATION_FRAMES = 2;
        this.MUSHROOM_ANIMATION_DURATION = 0.3;
        this.MUSHROOM_SCALE = 0.15;
        this.MUSHROOM_WIDTH = this.MUSHROOM_FRAME_WIDTH * this.MUSHROOM_SCALE;
        this.MUSHROOM_HEIGHT = this.MUSHROOM_FRAME_HEIGHT * this.MUSHROOM_SCALE;
    }
    

    reset() {
        this.health = 3;
        this.coinsForHeart = 0;

        this.chanceMessage = "";
        this.chanceMessageTimer = 0;

        if (this.evilWaveTimeouts) {
            this.evilWaveTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
            this.evilWaveTimeouts = [];
        }

        this.pipeArray = [];
        this.snappingPlants = [];
        this.coins = [];
        this.mushrooms = []; 
        this.gameStarted = false;
        this.pipePairCount = 0;
        this.hasCollided = false;

        this.dangerDisplayTime = 0;
        this.evilWaveActive = false;
        this.evilWaveTriggered = false;
        this.evilWaveBirdsSpawned = 0;
        this.enemyBigBirds = [];
        this.plantExplosions = [];
        // Reset enemy shooters
        this.enemyShooters = [];

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

        if (this.level === 2) {
            let bird = this.getBird();
            if (bird) {
                bird.score = 15;
            }
        } else if (this.level === 3) {
            let bird = this.getBird();
            if (bird) {
                bird.score = 30;
            }
        }
        this.game.gameOver = false;
    }

    startGame() {
        this.gameStarted = true;
        this.dangerDisplayTime = 0;
        this.enemyBigBirds = [];
        this.evilWaveActive = false;
        this.evilWaveTriggered = false;
        this.evilWaveBirdsSpawned = 0;

        console.log("Game started; setting gameStarted to true.");

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
        let minOpening, maxOpening;
        let isNarrowPipeInLevel3 = false;
        if (this.level === 2) {
            const extraSpacing = 5;
            minOpening = this.minOpeningSnapping + extraSpacing;
            maxOpening = this.maxOpeningSnapping + extraSpacing;
        } else if (this.level === 3) {
            if (this.pipePairCount % 3 === 0) {
                minOpening = 30;
                maxOpening = 30;
                isNarrowPipeInLevel3 = true;
            } else {
                const extraSpacing = 10;
                minOpening = this.minOpeningSnapping + extraSpacing;
                maxOpening = this.maxOpeningSnapping + extraSpacing;
            }
        } else {
            minOpening = hasSnappingPlant ? this.minOpeningSnapping : this.minOpeningRegular;
            maxOpening = hasSnappingPlant ? this.maxOpeningSnapping : this.maxOpeningRegular;
        }
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
            isMoving: this.level === 3,
            movingTime: 0,
            movingDirection: Math.random() < 0.5 ? 1 : -1,
            originalTopHeight: topPipeHeight,
            originalOpening: opening,
            verticalRange: this.PIPE_VERTICAL_RANGE
        };
        const bottomPipe = {
            x: this.width,
            y: topPipeHeight + opening,
            width: this.pipeWidth,
            height: this.baseY - (topPipeHeight + opening),
            type: 'bottom',
            passed: false,
            isMoving: this.level === 3,
            movingTime: 0,
            movingDirection: topPipe.movingDirection * -1,
            originalY: topPipeHeight + opening,
            verticalRange: this.PIPE_VERTICAL_RANGE
        };
        if (this.level === 3 && isNarrowPipeInLevel3) {
            topPipe.isNarrow = true;
            bottomPipe.isNarrow = true;
            topPipe.isMoving = true;
            bottomPipe.isMoving = true;
            topPipe.pairId = this.pipePairCount;
            bottomPipe.pairId = this.pipePairCount;
            const minTopPipeHeightNarrow = 50;
            const maxTopPipeHeightNarrow = this.baseY - 30 - 50;
            const newTopPipeHeight = minTopPipeHeightNarrow + Math.random() * (maxTopPipeHeightNarrow - minTopPipeHeightNarrow);
            topPipe.height = newTopPipeHeight;
            bottomPipe.y = topPipe.y + newTopPipeHeight + 30;
            bottomPipe.height = this.baseY - bottomPipe.y;
        }
        this.pipeArray.push(topPipe, bottomPipe);
        const minDistanceFromPipe = 100;
        const coinX = topPipe.x + this.pipeWidth + minDistanceFromPipe + Math.random() * this.pipeWidth;
        const maxY = this.baseY - 50;
        const minY = 50;
        const coinY = minY + Math.random() * (maxY - minY);
        this.coins.push(new Coin(this.game, coinX, coinY, this.pipeSpeed, this.coinSound));
        if (this.level === 2 && (this.pipePairCount + 1) % 3 === 0) {
            const groupCount = Math.floor(Math.random() * 4) + 3;
            const groupSpacing = 10;
            let groupX;
            let attempts = 0;
            do {
                groupX = Math.random() * (this.width - (groupCount * this.MUSHROOM_WIDTH + (groupCount - 1) * groupSpacing));
                attempts++;
                if (attempts > 10) break;
            } while (
                this.pipeArray.some(pipe =>
                    pipe.type === 'bottom' &&
                    groupX < pipe.x + pipe.width &&
                    groupX + (groupCount * this.MUSHROOM_WIDTH + (groupCount - 1) * groupSpacing) > pipe.x
                )
            );
            for (let i = 0; i < groupCount; i++) {
                let mushroomX = groupX + i * (this.MUSHROOM_WIDTH + groupSpacing);
                this.mushrooms.push({
                    x: mushroomX,
                    y: this.baseY - this.MUSHROOM_HEIGHT,
                    elapsedTime: 0,
                    frame: 0,
                    velocityY: 0
                });
            }
        }
        const plantWidth = this.snappingPlantFrameWidth * this.snappingPlantScale;
        if ((this.level === 2 || this.level === 3 || this.pipePairCount % 2 === 0) &&
            !(this.level === 3 && isNarrowPipeInLevel3)) {
            if (Math.random() < 0.5) {
                const plantId = Date.now() + Math.random().toString(36).substr(2, 5);
                const topPlantX = this.width + (this.pipeWidth - plantWidth) / 2;
                const topPlantY = topPipeHeight - this.snappingPlantTopFrameHeight * this.snappingPlantScale + 20;
                this.snappingPlants.push({
                    id: plantId,
                    x: topPlantX,
                    y: topPlantY,
                    elapsedTime: 0,
                    type: "top",
                    state: "IDLE",
                    lastFrame: -1,
                    isDead: false,
                    deadTimer: 0,
                    pipe: topPipe
                });
                topPipe.hasPlant = true;
            } else {
                const plantId = Date.now() + Math.random().toString(36).substr(2, 5);
                const bottomPlantX = this.width + (this.pipeWidth - plantWidth) / 2;
                const bottomPlantY = bottomPipe.y - (this.snappingPlantFrameHeight * this.snappingPlantScale);
                this.snappingPlants.push({
                    id: plantId,
                    x: bottomPlantX,
                    y: bottomPlantY,
                    elapsedTime: 0,
                    type: "bottom",
                    state: "IDLE",
                    lastFrame: -1,
                    isDead: false,
                    deadTimer: 0,
                    pipe: bottomPipe
                });
                bottomPipe.hasPlant = true;
            }
        }
        this.pipePairCount++;

        // --- NEW: Every 5 pipes in Level 3, spawn an enemy shooter ---
        if (this.level === 3 && this.pipePairCount > 0 && this.pipePairCount % 5 === 0) {
            this.spawnEnemyShooter();
        }
        // -------------------------------------------------------------

        if (!this.evilWaveTriggered && this.pipePairCount === this.EVIL_WAVE_PIPE_COUNT) {
            this.triggerEvilWave();
            this.postEvilWaveDelayTimer = this.postEvilWaveDelay;
        }
    }
    
    // --- NEW: Spawn enemy shooter method ---
    spawnEnemyShooter() {
        const shootInterval = 2 + Math.random() * 2; // random between 2 and 4 seconds
        const shooter = {
            // Spawn off-screen on the left
            x: - (this.enemyShooterWidth * this.enemyShooterScale),
            // Random vertical position within the game area (above the base)
            y: Math.random() * (this.baseY - this.enemyShooterHeight * this.enemyShooterScale),
            width: this.enemyShooterWidth * this.enemyShooterScale,
            height: this.enemyShooterHeight * this.enemyShooterScale,
            elapsedTime: 0,
            shootTimer: shootInterval, // Start at the interval value so it fires immediately
            shootInterval: shootInterval
        };
        this.enemyShooters.push(shooter);
    }
    
    // -------------------------------------------
    
    // NEW: Method to spawn a projectile from an enemy shooter
    spawnEnemyShooterProjectile(shooter) {
        const bird = this.getBird();
        if (!bird) return;
        
        // Get shooter center
        const shooterCenterX = shooter.x + shooter.width / 2;
        const shooterCenterY = shooter.y + shooter.height / 2;
        
        // Calculate bird center (using same offset as in collision methods)
        const birdLeft = bird.x + this.BIRD_X_OFFSET;
        const birdTop = bird.y + (70 * 1.2 - this.BIRD_HEIGHT) / 2;
        const birdCenterX = birdLeft + this.BIRD_WIDTH / 2;
        const birdCenterY = birdTop + this.BIRD_HEIGHT / 2;
        
        const dx = birdCenterX - shooterCenterX;
        const dy = birdCenterY - shooterCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Define the projectile's speed (in pixels per second)
        const speed = 700;
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;
        
        const projectile = {
            x: shooterCenterX,
            y: shooterCenterY,
            vx: vx * this.game.clockTick,
            vy: vy * this.game.clockTick,
            radius: 30 // Projectile radius
        };
        
        this.enemyShooterProjectiles.push(projectile);
    }
    
    triggerEvilWave() {
        if (this.evilWaveTimeouts) {
            this.evilWaveTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
            this.evilWaveTimeouts = [];
        }

        this.evilWaveActive = true;
        this.evilWaveTriggered = true;
        this.pipeArray = [];
        this.snappingPlants = [];
        this.coins = [];
        this.enemyShooters = [];
        clearInterval(this.pipeSpawnInterval);
        this.pipeSpawnInterval = null;

        if (this.level === 1) {
            this.evilWaveBirdsSpawned = 0;
            this.spawnEnemyBigBird();
            this.evilWaveBirdsSpawned++;
            
            const spawnNextBird = () => {
                if (this.evilWaveBirdsSpawned < 8) {
                    const randomDelay = 800 + Math.random() * 400;
                    const timerId = setTimeout(() => {
                        this.spawnEnemyBigBird();
                        this.evilWaveBirdsSpawned++;
                        spawnNextBird();
                    }, randomDelay);
                    this.evilWaveTimeouts.push(timerId);
                }
            };
            spawnNextBird();
        } else {
            // For level 2 and 3, just show the level passed message after a short delay
            setTimeout(() => {
                this.evilWaveActive = false;
                this.levelPassedMessageTime = this.levelPassedMessageDuration;
                this.postEvilWaveDelayTimer = this.postEvilWaveDelay;
            }, 2000);
        }
    }

    spawnEnemyBigBird() {
        const enemyWidth = this.BIRD_WIDTH * 3;
        const enemyHeight = this.BIRD_HEIGHT * 2;
        
        const playerBird = this.getBird();
        const playerY = playerBird ? playerBird.y : this.height / 2;
        
        const zones = {
            TOP: this.height * 0.2,
            MIDDLE: this.height * 0.5,
            BOTTOM: this.height * 0.8
        };
        
        let y;
        let targetY;
        let verticalSpeed;
        
        const attackPattern = Math.random();
        
        if (attackPattern < 0.4) {
            y = playerY + (Math.random() - 0.5) * 100;
            targetY = playerY;
            verticalSpeed = (targetY - y) / 60; 
        } else if (attackPattern < 0.7) {
            if (playerY < this.height / 2) {
                y = zones.BOTTOM;
                targetY = zones.TOP;
            } else {
                y = zones.TOP;
                targetY = zones.BOTTOM;
            }
            verticalSpeed = (targetY - y) / 50; 
        } else {
            const positions = [zones.TOP, zones.MIDDLE, zones.BOTTOM];
            y = positions[Math.floor(Math.random() * positions.length)];
            targetY = playerY;
            verticalSpeed = (targetY - y) / 45;
        }
        
        const minY = 50;
        const maxY = this.baseY - enemyHeight - 50;
        y = Math.min(Math.max(y, minY), maxY);
        
        const baseSpacing = 300;
        const spacingVariation = Math.random() * 100 - 50;
        const x = this.width + (this.evilWaveBirdsSpawned * baseSpacing) + spacingVariation;
        
        const enemyBigBird = {
            x: x,
            y: y,
            width: enemyWidth,
            height: enemyHeight,
            elapsedTime: 0,
            verticalSpeed: verticalSpeed,
            targetY: targetY,
            accelerationY: 0.1 + Math.random() * 0.2, 
            maxSpeed: 3 + Math.random() * 2,
            originalY: y,
            attackPattern: attackPattern
        };
        
        this.enemyBigBirds.push(enemyBigBird);
        this.dangerDisplayTime = this.DANGER_DURATION;
    }

    updateEnemyBirds() {
        for (let bird of this.enemyBigBirds) {
            bird.x -= this.enemyBigBirdSpeed;
    
            if (bird.attackPattern < 0.4) {
                const playerBird = this.getBird();
                if (playerBird) {
                    bird.targetY = playerBird.y;
                }
            }
    
            const distanceToTarget = bird.targetY - bird.y;
            bird.verticalSpeed += Math.sign(distanceToTarget) * bird.accelerationY;
            bird.verticalSpeed = Math.min(Math.max(bird.verticalSpeed, -bird.maxSpeed), bird.maxSpeed);
            bird.y += bird.verticalSpeed;
            
            const minY = 50;
            const maxY = this.baseY - bird.height - 50;
            if (bird.y < minY || bird.y > maxY) {
                bird.y = bird.y < minY ? minY : maxY;
                bird.verticalSpeed *= -0.5;
            }
        }
    }

    update() {
        if (!this.gameStarted || this.game.gameOver) return;
    
        const bird = this.getBird();
        if (bird) {
            const birdTop = bird.y + (70 * 1.2 - this.BIRD_HEIGHT) / 2;
            const birdBottom = birdTop + this.BIRD_HEIGHT;
            if (birdBottom >= this.baseY) {
                this.playSound(this.dieSound);
                this.health = 0;
                this.game.gameOver = true;
                this.game.hasCollided = true;
                bird.velocity = 0;
                bird.rotation = bird.maxRotationDown;
                this.scoreManager.updateBestScore(bird.score);
                this.chanceMessage = "";
                this.chanceMessageTimer = 0;
                return;
            }
        }
        
        if (this.dangerDisplayTime > 0) {
            this.dangerDisplayTime -= this.game.clockTick;
        }
        
        if (this.chanceMessageTimer > 0) {
            this.chanceMessageTimer -= this.game.clockTick;
            if (this.chanceMessageTimer <= 0) {
                this.chanceMessage = "";
            }
        }
    
        this.updateEnemyBirds();
    
        if (this.evilWaveActive &&
            this.evilWaveBirdsSpawned >= 8 &&
            this.enemyBigBirds.length === 0 &&
            this.dangerDisplayTime <= 0) {
            this.evilWaveActive = false;
            this.levelPassedMessageTime = this.levelPassedMessageDuration;
            this.postEvilWaveDelayTimer = this.postEvilWaveDelay;
        }
    
        if (this.levelPassedMessageTime > 0) {
            this.levelPassedMessageTime -= this.game.clockTick;
            if (this.levelPassedMessageTime <= 0) {
                if (this.level === 1 || this.level === 2) { 
                    this.flashTimer = this.FLASH_DURATION;
                }
            }
        }
        
    
        if (this.flashTimer > 0) {
            this.flashTimer -= this.game.clockTick;
            
            if (this.flashTimer <= 0) {
                if (this.level === 1) {
                    console.log("Transitioning to Level 2...");
                    this.transitionToLevel2();
                    return;
                } else if (this.level === 2) {
                    console.log("Transitioning to Level 3...");
                    this.transitionToLevel3();
                    return;
                }
            }
        }
        
    
        if (this.postEvilWaveDelayTimer > 0) {
            this.postEvilWaveDelayTimer -= this.game.clockTick;
            return;
        }
    
        if (!this.evilWaveActive && !this.pipeSpawnInterval) {
            this.setupPipeSpawning();
        }
    
        this.updateGameObjects();
        
        if (this.level === 2) {
            this.mushrooms.forEach(mushroom => {
                mushroom.x -= this.pipeSpeed;
                
                const bird = this.getBird();
                if (bird) {
                    const mushroomCenterX = mushroom.x + this.MUSHROOM_WIDTH / 2;
                    const birdCenterX = bird.x + this.BIRD_WIDTH / 2;
                    const dx = Math.abs(mushroomCenterX - birdCenterX);
                    if (dx < 150 && mushroom.y >= this.baseY - this.MUSHROOM_HEIGHT - 1) {
                        const minJumpSpeed = 8;   // minimum jump speed
                        const maxJumpSpeed = 15;  // maximum jump speed
                        mushroom.velocityY = - (Math.random() * (maxJumpSpeed - minJumpSpeed) + minJumpSpeed);
                    }
                }
                
                const gravity = 20;
                mushroom.velocityY += gravity * this.game.clockTick;
                mushroom.y += mushroom.velocityY;
                
                if (mushroom.y > this.baseY - this.MUSHROOM_HEIGHT) {
                    mushroom.y = this.baseY - this.MUSHROOM_HEIGHT;
                    mushroom.velocityY = 0;
                }
                
                mushroom.elapsedTime += this.game.clockTick;
                if (mushroom.elapsedTime >= this.MUSHROOM_ANIMATION_DURATION) {
                    mushroom.elapsedTime = 0;
                    mushroom.frame = (mushroom.frame + 1) % this.MUSHROOM_ANIMATION_FRAMES;
                }
            });
            this.mushrooms = this.mushrooms.filter(m => m.x + this.MUSHROOM_WIDTH > 0);
        }
        
        this.handleCollisions();
        
        this.handleProjectileCollisions();
    }
    

    handleProjectileCollisions() {
        const bird = this.getBird();
        if (!bird || !bird.projectiles) return;
        
        for (let i = bird.projectiles.length - 1; i >= 0; i--) {
            const projectile = bird.projectiles[i];
            
            for (let j = 0; j < this.snappingPlants.length; j++) {
                const plant = this.snappingPlants[j];
                if (plant.isDead) continue; 
                
                const plantWidth = this.snappingPlantFrameWidth * this.snappingPlantScale;
                const plantHeight = plant.type === "top" 
                    ? this.snappingPlantTopFrameHeight * this.snappingPlantScale
                    : this.snappingPlantFrameHeight * this.snappingPlantScale;
                
                if (
                    projectile.x >= plant.x && 
                    projectile.x <= plant.x + plantWidth &&
                    projectile.y >= plant.y && 
                    projectile.y <= plant.y + plantHeight
                ) {
                    bird.projectiles.splice(i, 1);
                    
                    plant.isDead = true;
                    plant.deadTimer = 2; 
                    
                    this.createPlantExplosion(
                        plant.x + plantWidth / 2, 
                        plant.y + plantHeight / 2
                    );
                    
                    if (this.plantDeathSound) {
                        const deathSound = this.plantDeathSound.cloneNode();
                        deathSound.volume = 0.4;
                        deathSound.play().catch(e => console.log("Audio play failed:", e));
                    }
                    
                    break; 
                }
            }
        }
    }

    createPlantExplosion(x, y) {
        const particleCount = 30 + Math.floor(Math.random() * 20);
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 5;
            const size = 2 + Math.random() * 5;
            const life = 0.5 + Math.random() * 1;
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                life: life,
                maxLife: life,
                color: Math.random() < 0.7 ? 
                    `rgb(${150 + Math.random() * 100}, ${50 + Math.random() * 50}, 0)` : 
                    `rgb(${200 + Math.random() * 55}, ${200 + Math.random() * 55}, 0)`
            });
        }
        
        const shockwave = {
            x: x,
            y: y,
            radius: 5,
            maxRadius: 60,
            life: 0.5,
            maxLife: 0.5
        };
        
        this.plantExplosions.push({
            particles: particles,
            shockwave: shockwave,
            x: x,
            y: y,
            light: {
                radius: 80,
                intensity: 1,
                life: 0.5
            }
        });
    }

    updateGameObjects() {
        if (!this.evilWaveActive) {
            this.pipeArray.forEach(pipe => {
                pipe.x -= this.pipeSpeed;
    
                if (this.level === 3 && pipe.isMoving) {
                    const bird = this.getBird();
                    const pipeCenterX = pipe.x + pipe.width/2;
                    const birdDistance = pipeCenterX - (bird?.x || 0);

                    // For narrow pipes (every 3rd pipe pair)
                    if (pipe.isNarrow) {
                        if (!pipe.phase) {
                            // Initial closed state
                            pipe.phase = 'closed';
                            pipe.progress = 0;
                            pipe.verticalOffset = 30; // Start with smallest gap
                        }

                        // Calculate activation distance based on scroll speed
                        const activationDistance = 400;
                        const deactivationDistance = -100;

                        if (pipe.phase === 'closed' && birdDistance < activationDistance) {
                            pipe.phase = 'opening';
                        } else if (pipe.phase === 'open' && birdDistance < deactivationDistance) {
                            pipe.phase = 'closing';
                        }

                        // Update pipe state
                        switch(pipe.phase) {
                            case 'opening':
                                pipe.progress += this.game.clockTick * 1.5; // Opening speed
                                if (pipe.progress >= 1) {
                                    pipe.progress = 1;
                                    pipe.phase = 'open';
                                }
                    break;
                            case 'closing':
                                pipe.progress -= this.game.clockTick * 2; // Closing speed
                                if (pipe.progress <= 0) {
                                    pipe.progress = 0;
                                    pipe.phase = 'closed';
                }
                    break;
                        }

                        // Calculate vertical movement using easing function
                        const easedProgress = this.easeInOutQuad(pipe.progress);
                        pipe.verticalOffset = 30 + (0) * easedProgress; // 30-30 range (stays closed)
                        
                        // For bottom pipe in pair
                        if (pipe.type === 'bottom') {
                            const topPipe = this.pipeArray.find(p => p.pairId === pipe.pairId && p.type === 'top');
                            if (topPipe) {
                                const maxOpening = 120;
                                const currentOpening = maxOpening * easedProgress;
                                pipe.y = topPipe.y + topPipe.height + currentOpening;
                                pipe.height = this.baseY - pipe.y;
                            }
                        }
            } else {
                        // Regular moving pipes (non-narrow)
                        pipe.movingTime += this.game.clockTick;
                        const verticalOffset = Math.sin(pipe.movingTime * this.PIPE_VERTICAL_SPEED) * pipe.verticalRange;
                        
            if (pipe.type === 'top') {
                            pipe.y = 2;
                            pipe.height = pipe.originalTopHeight - verticalOffset;
            } else {
                            pipe.y = pipe.originalY + verticalOffset;
                            pipe.height = this.baseY - (pipe.originalY + verticalOffset);
                        }
                    }
                }
            });
        }
    
        this.snappingPlants.forEach(plant => {
            plant.x -= this.pipeSpeed;
    
            if (this.level === 3 && plant.pipe && plant.pipe.isMoving) {
                if (plant.type === "top") {
                    const plantHeight = this.snappingPlantTopFrameHeight * this.snappingPlantScale;
                    plant.y = plant.pipe.y + plant.pipe.height - plantHeight + 20;
                } else {
                    const plantHeight = this.snappingPlantFrameHeight * this.snappingPlantScale;
                    plant.y = plant.pipe.y - plantHeight;
                }
            }
    
            if (!plant.isDead) {
                plant.elapsedTime += this.game.clockTick;
                const frame = Math.floor(plant.elapsedTime / this.snappingPlantFrameDuration) % this.snappingPlantFrameCount;
                if (frame === 3 && plant.lastFrame !== 3) {
                    this.playSound(this.plantChompSound);
                }
                plant.lastFrame = frame;
                if (frame === this.snappingPlantFrameCount - 1) {
                    plant.elapsedTime = 0;
                }
            } else {
                plant.deadTimer -= this.game.clockTick;
                if (plant.deadTimer <= 0) {
                    plant.isDead = false;
                }
            }
        });
    
        this.coins.forEach(coin => {
            coin.update();
        });
    
        this.enemyBigBirds.forEach(enemy => {
            enemy.x -= this.enemyBigBirdSpeed;
            enemy.elapsedTime += this.game.clockTick;
        });
    
        // --- NEW: Update enemy shooters (move them right and animate) ---
        this.enemyShooters.forEach(shooter => {
            shooter.x += this.enemyShooterSpeed;
            shooter.elapsedTime += this.game.clockTick;
            
            // Update shooter shooting timer
            shooter.shootTimer += this.game.clockTick;
            if (shooter.shootTimer >= shooter.shootInterval) {
                shooter.shootTimer = 0;
                this.spawnEnemyShooterProjectile(shooter);
            }
        });
        // Remove enemy shooters that have moved off the right side
        this.enemyShooters = this.enemyShooters.filter(shooter => shooter.x < this.width);
        // -----------------------------------------------------
    
        // --- NEW: Update enemy shooter projectiles ---
        this.enemyShooterProjectiles.forEach(projectile => {
            projectile.x += projectile.vx;
            projectile.y += projectile.vy;
        });
        // Remove projectiles that have gone off-screen
        this.enemyShooterProjectiles = this.enemyShooterProjectiles.filter(projectile => {
            return projectile.x + projectile.radius > 0 &&
                projectile.x - projectile.radius < this.width &&
                projectile.y + projectile.radius > 0 &&
                projectile.y - projectile.radius < this.height;
        });
        // -----------------------------------------------------
    
        for (let i = this.plantExplosions.length - 1; i >= 0; i--) {
            const explosion = this.plantExplosions[i];
    
            for (let j = explosion.particles.length - 1; j >= 0; j--) {
                const particle = explosion.particles[j];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1;
                particle.life -= this.game.clockTick;
    
                if (particle.life <= 0) {
                    explosion.particles.splice(j, 1);
                }
            }
    
            if (explosion.shockwave) {
                explosion.shockwave.life -= this.game.clockTick;
                explosion.shockwave.radius = (1 - explosion.shockwave.life / explosion.shockwave.maxLife) * explosion.shockwave.maxRadius;
    
                if (explosion.shockwave.life <= 0) {
                    explosion.shockwave = null;
                }
            }
    
            if (explosion.light) {
                explosion.light.life -= this.game.clockTick;
                explosion.light.intensity = explosion.light.life / 0.5;
    
                if (explosion.light.life <= 0) {
                    explosion.light = null;
                }
            }
    
            if (explosion.particles.length === 0 && !explosion.shockwave && !explosion.light) {
                this.plantExplosions.splice(i, 1);
            }
        }
    
        this.pipeArray = this.pipeArray.filter(pipe => pipe.x + pipe.width > 0);
        this.snappingPlants = this.snappingPlants.filter(plant => {
            const isOnScreen = plant.x + (this.snappingPlantFrameWidth * this.snappingPlantScale) > 0;
            const hasCompletedAnimation = !plant.isDead && plant.elapsedTime >= this.snappingPlantFrameDuration * this.snappingPlantFrameCount;
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
                if (!plant.isDead && this.checkPlantCollision(bird, plant)) {
                    this.handleCollision(bird);
                    break;
                }
            }

            this.enemyBigBirds.forEach(enemy => {
                if (this.checkEnemyBigBirdCollision(bird, enemy)) {
                    this.handleCollision(bird);
                }
            });
            
            // Check collision with enemy shooters
            this.enemyShooters.forEach(shooter => {
                if (this.checkEnemyShooterCollision(bird, shooter)) {
                    this.handleCollision(bird);
                }
            });
            
            if (this.level === 2) {
                this.mushrooms.forEach(mushroom => {
                    if (this.checkMushroomCollision(bird, mushroom)) {
                        this.handleCollision(bird);
                    }
                });
            }
            
            // NEW: Check collisions with enemy shooter projectiles
            for (let i = this.enemyShooterProjectiles.length - 1; i >= 0; i--) {
                const projectile = this.enemyShooterProjectiles[i];
                if (this.checkProjectileCollisionWithBird(bird, projectile)) {
                    this.handleCollision(bird);
                    this.enemyShooterProjectiles.splice(i, 1); // Remove the projectile
                    break;
                }
            }
        }

        this.coins.forEach(coin => {
            if (!coin.collected && coin.checkCollision(bird)) {
                coin.collected = true;
                this.coinProgress.collectCoin();
                
                if (this.health < 3) {
                    this.coinsForHeart++;
                }
        
                if (this.coinsForHeart >= 5 && this.health < 3) {
                    this.heartDisplay.collectCoin();
                    this.health++;
                    this.coinsForHeart = 0; 
        
                    this.chanceMessage = "Heart Restored!";
                    this.chanceMessageTimer = this.CHANCE_MESSAGE_DURATION;
        
                    if (this.heartSound) {
                        this.heartSound.currentTime = 0;
                        this.heartSound.play();
                    }
                }
        
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

    checkMushroomCollision(bird, mushroom) {
        const birdLeft = bird.x + this.BIRD_X_OFFSET;
        const birdRight = birdLeft + this.BIRD_WIDTH;
        const birdTop = bird.y + (70 * 1.2 - this.BIRD_HEIGHT) / 2;
        const birdBottom = birdTop + this.BIRD_HEIGHT;

        const mushroomLeft = mushroom.x;
        const mushroomRight = mushroom.x + this.MUSHROOM_WIDTH;
        const mushroomTop = mushroom.y;
        const mushroomBottom = mushroom.y + this.MUSHROOM_HEIGHT;

        return (
            birdRight > mushroomLeft &&
            birdLeft < mushroomRight &&
            birdBottom > mushroomTop &&
            birdTop < mushroomBottom
        );
    }

    checkEnemyShooterCollision(bird, shooter) {
        const birdLeft = bird.x + this.BIRD_X_OFFSET;
        const birdRight = birdLeft + this.BIRD_WIDTH;
        const birdTop = bird.y + (70 * 1.2 - this.BIRD_HEIGHT) / 2;
        const birdBottom = birdTop + this.BIRD_HEIGHT;
        
        // Apply a smaller collision box for the shooter (60% of actual size)
        const collisionPadding = shooter.width * 0.2;
        const shooterLeft = shooter.x + collisionPadding;
        const shooterRight = shooter.x + shooter.width - collisionPadding;
        const shooterTop = shooter.y + collisionPadding;
        const shooterBottom = shooter.y + shooter.height - collisionPadding;
        
        return (
            birdRight > shooterLeft &&
            birdLeft < shooterRight &&
            birdBottom > shooterTop &&
            birdTop < shooterBottom
        );
    }

    // NEW: Check collision between a bird and a projectile
    checkProjectileCollisionWithBird(bird, projectile) {
        const birdLeft = bird.x + this.BIRD_X_OFFSET;
        const birdRight = birdLeft + this.BIRD_WIDTH;
        const birdTop = bird.y + (70 * 1.2 - this.BIRD_HEIGHT) / 2;
        const birdBottom = birdTop + this.BIRD_HEIGHT;
        
        return (
            projectile.x + projectile.radius > birdLeft &&
            projectile.x - projectile.radius < birdRight &&
            projectile.y + projectile.radius > birdTop &&
            projectile.y - projectile.radius < birdBottom
        );
    }
    
    handleCollision(bird) {
        this.playSound(this.hitSound);
        if (this.swooshSound) {
            this.swooshSound.currentTime = 0;
            this.swooshSound.play();
        }
        if (!bird.invincible) {
            if (this.health > 0) {
                this.health--;
                this.chanceMessage = `${this.health} more ${this.health === 1 ? "chance" : "chances"}!`;
                this.chanceMessageTimer = this.CHANCE_MESSAGE_DURATION;
                bird.invincible = true;
                bird.invincibleTimer = 2; 
                
                this.coinsForHeart = 0;
            }
            if (this.health <= 0) {
                this.game.gameOver = true;
                this.game.hasCollided = true;
                bird.velocity = 0;
                bird.rotation = bird.maxRotationDown;
                this.scoreManager.updateBestScore(bird.score);
                this.chanceMessage = "";
                this.chanceMessageTimer = 0;
                this.coinsForHeart = 0;
            }
        }
    }

    getBird() {
        return this.game.entities.find(entity => entity instanceof Bird) || null;
    }

    drawHearts(ctx) {
        this.heartDisplay.draw(ctx, this.health);
        
        if (this.health < 3 && !this.game.gameOver) {
            ctx.font = "16px Arial";
            ctx.fillStyle = "#32CD32"; 
            ctx.textAlign = "left";
            ctx.fillText("Collect 5 coins to get a heart!", 45, 140);
        }
        
        if (this.chanceMessageTimer > 0) {
            ctx.font = "24px Arial";
            ctx.fillStyle = "red";
            ctx.textAlign = "center";
            ctx.fillText(this.chanceMessage, this.width / 2, 120);
        }
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
            if (plant.elapsedTime < 0 || plant.isDead) return;
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
    
        // --- NEW: Draw enemy shooters (only active in Level 3) ---
        this.enemyShooters.forEach(shooter => {
            const frameIndex = Math.floor(shooter.elapsedTime / this.enemyShooterFrameDuration) % this.enemyShooterFrameCount;
            ctx.drawImage(
                this.enemyShooterSprite,
                frameIndex * this.enemyShooterWidth, 0,
                this.enemyShooterWidth, this.enemyShooterHeight,
                shooter.x, shooter.y, shooter.width, shooter.height
            );
        });
        // -----------------------------------------------------
    
        // --- NEW: Draw enemy shooter projectiles ---
        this.enemyShooterProjectiles.forEach(projectile => {
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        // -----------------------------------------------------
    
        this.plantExplosions.forEach(explosion => {
            if (explosion.light) {
                const gradient = ctx.createRadialGradient(
                    explosion.x, explosion.y, 0,
                    explosion.x, explosion.y, explosion.light.radius
                );
                
                gradient.addColorStop(0, `rgba(255, 220, 50, ${explosion.light.intensity * 0.8})`);
                gradient.addColorStop(0.5, `rgba(255, 100, 20, ${explosion.light.intensity * 0.4})`);
                gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(explosion.x, explosion.y, explosion.light.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            if (explosion.shockwave) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${explosion.shockwave.life / explosion.shockwave.maxLife * 0.5})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(explosion.shockwave.x, explosion.shockwave.y, explosion.shockwave.radius, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            explosion.particles.forEach(particle => {
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.life / particle.maxLife;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            ctx.globalAlpha = 1;
        });
    
        this.enemyBigBirds.forEach(enemy => {
            const frameWidth = 250;
            const frameHeight = 202;
            const frameIndex = Math.floor(enemy.elapsedTime / this.enemyBigBirdFrameDuration) % this.enemyBigBirdFrameCount;
            ctx.drawImage(
                this.enemyBigBirdSprite,
                frameIndex * frameWidth, 0, frameWidth, frameHeight,
                enemy.x, enemy.y, enemy.width, enemy.height
            );
        });
    
        if (this.level === 2) {
            this.mushrooms.forEach(mushroom => {
                ctx.drawImage(
                    this.mushroomSprite,
                    mushroom.frame * this.MUSHROOM_FRAME_WIDTH,
                    0,
                    this.MUSHROOM_FRAME_WIDTH,
                    this.MUSHROOM_FRAME_HEIGHT,
                    mushroom.x,
                    mushroom.y,
                    this.MUSHROOM_WIDTH,
                    this.MUSHROOM_HEIGHT
                );
            });
        }
    
        ctx.drawImage(this.base, 0, this.baseY, this.width, this.baseHeight);
        this.coinProgress.draw(ctx);
        this.drawHearts(ctx);
    
        if (this.chanceMessageTimer > 0) {
            ctx.font = "24px Arial";
            ctx.fillStyle = "red";  
            ctx.textAlign = "center";
            ctx.fillText(this.chanceMessage, this.width / 2, 120);
        }
    
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
            this.drawGameOver(ctx);
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

    drawGameOver(ctx) {
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
    }

    transitionToLevel2() {
        console.log("transitionToLevel2() called. Transitioning from Level 1 to Level 2.");
        this.level = 2;
    }
    transitionToLevel3() {
        console.log("transitionToLevel3() called. Transitioning from Level 2 to Level 3.");
        this.level = 3;
    }

    handleKeyDown(e) {
        if (!this.gameStarted && !this.game.gameOver) {
            if (e.key === ' ') {
                this.startGame();
            }
        } else if (this.game.gameOver) {
            if (e.key === 'Enter') {
                this.reset();
            }
        }
    }

    // Add easing function for smooth animation
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
}
