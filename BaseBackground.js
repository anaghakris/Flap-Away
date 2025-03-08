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
        
        // --- NEW: Dragon Enemy for Level 3 ---
        this.dragonSprite = ASSET_MANAGER.getAsset("./Sprites/Dragon/sprite_sheet.png");
        this.dragonFrameCount = 4;
        this.dragonWidth = 812;
        this.dragonHeight = 675;
        this.dragonScale = 0.2; // Adjust scale as needed
        this.dragonFrameDuration = 0.2;
        this.dragon = null;  // Will hold the dragon instance when spawned
        this.dragonHoverSpeed = 1.5;
        this.dragonHoverRange = 50;
        this.dragonLifetime = 15; // 10 seconds before completing the wave
        this.dragonFireballs = []; // Array to store dragon fireballs
        this.dragonFireballInterval = 1.0; // Shoot a fireball every 1 second
        this.dragonCompletionTimer = null; // Store the setTimeout ID
        // -------------------------------------------
        
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

        this.shockwave = {
            x: 0,
            y: 0,
            radius: 0,
            maxRadius: 250,
            pulseRadius: 0,
            life: 0,
            maxLife: 10.0, // Changed from 3.0 to 10.0 to match invincibility duration
            pulseFrequency: 8,
            color: 'rgba(0, 180, 255, 0.6)',
            pulseColor: 'rgba(100, 220, 255, 0.8)'
        };
        // We'll add sound later
        // this.shockwaveSound = ASSET_MANAGER.getAsset("./audio/shockwave.wav");

        this.gameCompleted = false;
        this.gameCompletedMessageTime = 0;
        this.GAME_COMPLETED_DURATION = 4.0;

        this.victoryEffects = {
            fireworks: [],
            stars: [],
            confettiColors: [
                '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
                '#FF00FF', '#00FFFF', '#FFA500', '#FF4500'
            ],
            confetti: []
        };

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
        
        // Sound for dragon fireballs
        this.fireWhooshSound = ASSET_MANAGER.getAsset("./audio/sfx_swooshing.wav");
        // Using swoosh sound for fire if no dedicated fire sound is available
        if (this.fireWhooshSound) {
            this.fireWhooshSound.volume = 0.35;
        }
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
        this.enemyBigBirds = [];
        this.coinsForHeart = 0;

        this.mushrooms = [];
        this.enemyShooters = [];
        this.enemyShooterProjectiles = [];
        this.dragon = null; // Reset the dragon
        this.dragonFireballs = []; // Reset the dragon fireballs
        this.plantExplosions = []; // Clear all explosion effects

        // Reset shockwave state
        this.shockwaveActive = false;
        this.shockwave.life = 0;
        this.shockwave.radius = 0;
        this.shockwave.pulseRadius = 0;

        this.gameStarted = false;
        this.hasCollided = false;
        this.pipePairCount = 0;

        this.dangerDisplayTime = 0;
        this.DANGER_DURATION = 1.0;
        this.evilWaveActive = false;
        this.evilWaveTriggered = false;
        this.EVIL_WAVE_PIPE_COUNT = 17;
        this.evilWaveBirdsSpawned = 0;

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
        this.gameCompleted = false;
        this.gameCompletedMessageTime = 0;

        // Clear the dragon completion timer
        if (this.dragonCompletionTimer) {
            clearTimeout(this.dragonCompletionTimer);
            this.dragonCompletionTimer = null;
        }
    }

    startGame() {
        this.gameStarted = true;
        this.dangerDisplayTime = 0;
        this.enemyBigBirds = [];
        this.enemyShooters = [];
        this.enemyShooterProjectiles = [];
        this.dragon = null; // Clear the dragon when starting/restarting the game
        this.dragonFireballs = []; // Clear the dragon fireballs
        this.evilWaveActive = false;
        this.evilWaveTriggered = false;
        this.evilWaveBirdsSpawned = 0;

        console.log("Game started; setting gameStarted to true.");

        this.game.entities.forEach(entity => {
            if (entity instanceof Bird) {
                entity.startGame();
            }
        });

        // --- FIXED: Only spawn an enemy shooter at the first start of level 3, not after reset ---
        // We'll now rely on the pipePairCount condition in spawnPipePair to handle shooter spawning
        if (this.level === 3 && this.enemyShooters.length === 0 && this.pipeArray.length === 0 && this.pipePairCount === 0) {
            console.log("Initial game start for level 3 - spawning first shooter");
            this.spawnEnemyShooter();
        }
        // -------------------------------------------------------------
    }

    setupPipeSpawning() {
        if (this.pipeSpawnInterval) {
            clearInterval(this.pipeSpawnInterval);
            this.pipeSpawnInterval = null;
        }
        
        // Don't set up pipe spawning if dragon wave is active
        if (this.evilWaveActive && this.level === 3 && this.dragon) {
            return;
        }
        
        this.pipeSpawnInterval = setInterval(() => {
            // Double-check here to make sure no pipes spawn during dragon wave
            if (this.gameStarted && !this.game.gameOver && !this.evilWaveActive && this.postEvilWaveDelayTimer <= 0 && (!this.dragon || this.level !== 3)) {
                this.spawnPipePair();
            }
        }, this.pipeInterval);
    }

    spawnPipePair() {
        // Don't spawn pipes if dragon wave is active or dragon exists
        if (!this.gameStarted || this.game.gameOver || this.evilWaveActive || this.postEvilWaveDelayTimer > 0 || this.dragon)
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

        // Spawn an enemy shooter on the first pipe in Level 3 if none exists
        if (this.level === 3 && this.pipePairCount === 1 && this.enemyShooters.length === 0) {
            this.spawnEnemyShooter();
        }

        if (!this.evilWaveTriggered && this.pipePairCount === this.EVIL_WAVE_PIPE_COUNT) {
            this.triggerEvilWave();
            this.postEvilWaveDelayTimer = this.postEvilWaveDelay;
        }
    }
    
    // --- NEW: Spawn enemy shooter method ---
    spawnEnemyShooter() {
        const shootInterval = 2 + Math.random() * 2; // random between 2 and 4 seconds
        
        // Simply spawn at a reasonable height near the base
        const baseOffset = 150; // Distance from the base
        const yPosition = this.baseY - baseOffset;
        
        // Start them from the right side of the screen
        const xPosition = this.width;
        
        // Clear existing shooters
        this.enemyShooters = [];
        
        const shooter = {
            // Start at the right side of the screen
            x: xPosition,
            // Position close to the base
            y: yPosition,
            width: this.enemyShooterWidth * this.enemyShooterScale,
            height: this.enemyShooterHeight * this.enemyShooterScale,
            elapsedTime: 0,
            shootTimer: shootInterval,
            shootInterval: shootInterval,
            // Start moving left
            direction: -1,
            // Set movement pattern
            initialX: xPosition,
            moveRange: 300, // How far to move in each direction
            // Use simpler movement pattern
            anchored: true
        };
        this.enemyShooters.push(shooter);
        
        // Debug message to confirm spawn
        console.log("Enemy shooter spawned at", xPosition, yPosition);
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
            radius: 20, // Slightly smaller radius for better visuals
            angle: Math.atan2(vy, vx), // Store angle for the fireball effect
            elapsedTime: 0, // For animation
            particles: [], // For the trail effect
            colors: {
                core: '#FF4500', // Orange-red
                mid: '#FF9300', // Orange
                outer: '#FFD700'  // Yellow/gold
            }
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
        
        // Clear pipe spawning interval completely
        if (this.pipeSpawnInterval) {
            clearInterval(this.pipeSpawnInterval);
            this.pipeSpawnInterval = null;
        }

        // Immediately deactivate powerups at start of dragon wave
        const bird = this.getBird();
        if (bird) {
            // Deactivate invincibility
            bird.invincible = false;
            bird.invincibleTimer = 0;
            bird.powerUpAnimation.active = false;
            if (bird.powerSoundLoop) {
                bird.powerSoundLoop.pause();
                bird.powerSoundLoop = null;
            }
        }
        
        // Deactivate shockwave
        this.shockwaveActive = false;
        this.shockwave.life = 0;

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
        } else if (this.level === 3) {
            // --- NEW: Spawn the Dragon for Level 3's finale ---
            this.spawnDragon();
            
            // Clear any existing dragon completion timer
            if (this.dragonCompletionTimer) {
                clearTimeout(this.dragonCompletionTimer);
            }
            
            // Set a timeout to end the dragon encounter after its lifetime
            this.dragonCompletionTimer = setTimeout(() => {
                this.evilWaveActive = false;
                this.gameCompleted = true;
                this.gameCompletedMessageTime = this.GAME_COMPLETED_DURATION;
                
                // Deactivate powerups before showing victory message
                const bird = this.getBird();
                if (bird) {
                    // Deactivate invincibility
                    bird.invincible = false;
                    bird.invincibleTimer = 0;
                    bird.powerUpAnimation.active = false;
                    if (bird.powerSoundLoop) {
                        bird.powerSoundLoop.pause();
                        bird.powerSoundLoop = null;
                    }
                }
                
                // Deactivate shockwave
                this.shockwaveActive = false;
                this.shockwave.life = 0;
                
                this.enemyShooters = [];
                this.enemyShooterProjectiles = [];
                this.snappingPlants = [];
                this.pipeArray = [];
                this.dragon = null;
                this.dragonFireballs = []; // Clear dragon fireballs
            }, this.dragonLifetime * 1000);
        } else {
            setTimeout(() => {
                this.evilWaveActive = false;
                
                if (this.level === 3) {
                    // This code is now handled in the level 3 specific block above
                } else {
                    this.levelPassedMessageTime = this.levelPassedMessageDuration;
                    this.postEvilWaveDelayTimer = this.postEvilWaveDelay;
                }
                
                if (this.level === 3) {
                    this.enemyShooters = [];
                    this.enemyShooterProjectiles = [];
                }
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
        
        // Ensure powerups remain deactivated while dragon is present
        if (this.dragon && bird) {
            // Deactivate invincibility
            if (bird.invincible) {
                bird.invincible = false;
                bird.invincibleTimer = 0;
                bird.powerUpAnimation.active = false;
                if (bird.powerSoundLoop) {
                    bird.powerSoundLoop.pause();
                    bird.powerSoundLoop = null;
                }
            }
            
            // Deactivate shockwave
            if (this.shockwaveActive) {
                this.shockwaveActive = false;
                this.shockwave.life = 0;
            }
        }
        
        if (this.gameCompleted) {
            // Make sure the bird is controlled/paused when game is completed
            if (bird) {
                // Ensure invincibility and shockwave are deactivated
                bird.invincible = false;
                bird.invincibleTimer = 0;
                if (bird.powerSoundLoop) {
                    bird.powerSoundLoop.pause();
                    bird.powerSoundLoop = null;
                }
                this.shockwaveActive = false;
            }
            
            if (this.gameCompletedMessageTime > 0) {
                this.gameCompletedMessageTime -= this.game.clockTick;
                if (this.gameCompletedMessageTime <= 0) {
                    this.game.gameOver = true;
                    this.game.gameCompleted = true; // New flag to indicate victory
                    
                    const bird = this.getBird();
                    if (bird) {
                        if (bird.y > this.height / 2) {
                            bird.y = this.height / 2 - 50;
                        }
                        if (bird.powerSoundLoop) {
                            bird.powerSoundLoop.pause();
                            bird.powerSoundLoop = null;
                        }
                    }
                }
            }
            return; // Skip rest of update when game is completed
        }
        
        // The rest of your code continues here
        if (this.game.gameCompleted) {
            this.generateVictoryEffects();
            this.updateVictoryEffects();
        }
    
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
    
        // --- NEW: Update the Dragon if it exists ---
        if (this.dragon) {
            this.updateDragon();
        }
        // ---------------------------------------
        
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
        
        // Update shockwave effect (in level 3)
        if (this.level === 3) {
            this.updateShockwave();
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
    
        // --- NEW: Update enemy shooters (move them back and forth and animate) ---
        this.enemyShooters.forEach(shooter => {
            // Back and forth movement logic
            if (shooter.anchored) {
                // Move shooter based on current direction
                shooter.x += this.enemyShooterSpeed * shooter.direction;
                
                // Check if shooter has reached its movement boundaries
                if (shooter.direction < 0 && shooter.x <= this.width - shooter.moveRange) {
                    // Reached left boundary, change direction to right
                    shooter.direction = 1;
                } else if (shooter.direction > 0 && shooter.x >= this.width) {
                    // Reached right boundary, change direction to left
                    shooter.direction = -1;
                }
            } else {
                // If not anchored, just move right (original behavior)
                shooter.x += this.enemyShooterSpeed;
            }
            
            shooter.elapsedTime += this.game.clockTick;
            
            // Update shooter shooting timer
            shooter.shootTimer += this.game.clockTick;
            if (shooter.shootTimer >= shooter.shootInterval) {
                shooter.shootTimer = 0;
                this.spawnEnemyShooterProjectile(shooter);
            }
        });
        // -----------------------------------------------------
    
        // --- NEW: Update enemy shooter projectiles ---
        this.enemyShooterProjectiles.forEach(projectile => {
            projectile.x += projectile.vx;
            projectile.y += projectile.vy;
            projectile.elapsedTime += this.game.clockTick;
            
            // Add particle effects for the trail
            if (Math.random() < 0.4) { // Occasionally add particles for performance
                const particleSize = 5 + Math.random() * 10;
                const particleLife = 0.3 + Math.random() * 0.3;
                const particleSpeed = 0.5 + Math.random() * 1;
                
                // Random offset from center
                const offsetX = (Math.random() - 0.5) * 15;
                const offsetY = (Math.random() - 0.5) * 15;
                
                // Calculate velocity opposite to projectile direction
                const particleAngle = projectile.angle + Math.PI + (Math.random() - 0.5) * 0.5;
                
                projectile.particles.push({
                    x: projectile.x + offsetX,
                    y: projectile.y + offsetY,
                    size: particleSize,
                    life: particleLife,
                    maxLife: particleLife,
                    vx: Math.cos(particleAngle) * particleSpeed,
                    vy: Math.sin(particleAngle) * particleSpeed,
                    color: Math.random() < 0.5 ? projectile.colors.mid : projectile.colors.outer
                });
            }
            
            // Update particles
            for (let i = projectile.particles.length - 1; i >= 0; i--) {
                const particle = projectile.particles[i];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life -= this.game.clockTick;
                
                if (particle.life <= 0) {
                    projectile.particles.splice(i, 1);
                }
            }
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

        // Check collisions with Dragon fireballs
        for (let i = this.dragonFireballs.length - 1; i >= 0; i--) {
            const fireball = this.dragonFireballs[i];
            if (this.checkDragonFireballCollisionWithBird(bird, fireball)) {
                // Create explosion at the point of impact
                this.createFireballExplosion(fireball.x, fireball.y);
                this.dragonFireballs.splice(i, 1); // Remove the fireball
                if (!bird.invincible) {
                    this.handleCollision(bird);
                }
            }
        }
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
            
            // Deactivate shockwave on collision
            if (this.level === 3 && this.shockwaveActive) {
                this.shockwaveActive = false;
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

    generateVictoryEffects() {
        if (!this.game.gameCompleted) return;
        
        // Generate a new firework
        if (Math.random() < 0.05) {
            const x = Math.random() * this.width;
            const y = this.height;
            const targetY = 100 + Math.random() * 200;
            
            this.victoryEffects.fireworks.push({
                x: x,
                y: y,
                targetY: targetY,
                vx: (Math.random() - 0.5) * 1,
                vy: -10 - Math.random() * 5,
                exploded: false,
                particles: [],
                color: this.victoryEffects.confettiColors[
                    Math.floor(Math.random() * this.victoryEffects.confettiColors.length)
                ]
            });
        }
        
        // Generate stars
        if (Math.random() < 0.1) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height / 2;
            
            this.victoryEffects.stars.push({
                x: x,
                y: y,
                size: 1 + Math.random() * 3,
                alpha: 0,
                maxAlpha: 0.5 + Math.random() * 0.5,
                fadeSpeed: 0.01 + Math.random() * 0.03,
                phase: 'in' // 'in' or 'out'
            });
        }
        
        // Generate confetti
        if (Math.random() < 0.1) {
            for (let i = 0; i < 5; i++) {
                const x = Math.random() * this.width;
                const y = -20;
                
                this.victoryEffects.confetti.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: 2 + Math.random() * 3,
                    size: 5 + Math.random() * 10,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.2,
                    color: this.victoryEffects.confettiColors[
                        Math.floor(Math.random() * this.victoryEffects.confettiColors.length)
                    ]
                });
            }
        }
    }

    updateVictoryEffects() {
        // Update fireworks
        for (let i = this.victoryEffects.fireworks.length - 1; i >= 0; i--) {
            const firework = this.victoryEffects.fireworks[i];
            
            if (!firework.exploded) {
                firework.x += firework.vx;
                firework.y += firework.vy;
                firework.vy += 0.2; // gravity
                
                // Check if reached apex
                if (firework.vy >= 0 || firework.y <= firework.targetY) {
                    firework.exploded = true;
                    
                    // Create explosion particles
                    const particleCount = 50 + Math.floor(Math.random() * 50);
                    for (let j = 0; j < particleCount; j++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 2 + Math.random() * 3;
                        
                        firework.particles.push({
                            x: firework.x,
                            y: firework.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 1,
                            color: firework.color
                        });
                    }
                }
            } else {
                // Update explosion particles
                for (let j = firework.particles.length - 1; j >= 0; j--) {
                    const particle = firework.particles[j];
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.vy += 0.1; // gravity
                    particle.life -= 0.02;
                    
                    if (particle.life <= 0) {
                        firework.particles.splice(j, 1);
                    }
                }
                
                // Remove firework if all particles are gone
                if (firework.particles.length === 0) {
                    this.victoryEffects.fireworks.splice(i, 1);
                }
            }
        }
        
        // Update stars
        for (let i = this.victoryEffects.stars.length - 1; i >= 0; i--) {
            const star = this.victoryEffects.stars[i];
            
            if (star.phase === 'in') {
                star.alpha += star.fadeSpeed;
                if (star.alpha >= star.maxAlpha) {
                    star.alpha = star.maxAlpha;
                    star.phase = 'out';
                }
            } else {
                star.alpha -= star.fadeSpeed;
                if (star.alpha <= 0) {
                    this.victoryEffects.stars.splice(i, 1);
                }
            }
        }
        
        // Update confetti
        for (let i = this.victoryEffects.confetti.length - 1; i >= 0; i--) {
            const confetti = this.victoryEffects.confetti[i];
            
            confetti.x += confetti.vx;
            confetti.y += confetti.vy;
            confetti.rotation += confetti.rotationSpeed;
            
            // Add some wind effect
            confetti.vx += (Math.random() - 0.5) * 0.1;
            
            // Remove if out of screen
            if (confetti.y > this.height) {
                this.victoryEffects.confetti.splice(i, 1);
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
        if (!this.game.gameOver) {
            this.enemyShooters.forEach(shooter => {
                const frameIndex = Math.floor(shooter.elapsedTime / this.enemyShooterFrameDuration) % this.enemyShooterFrameCount;
                ctx.drawImage(
                    this.enemyShooterSprite,
                    frameIndex * this.enemyShooterWidth, 0,
                    this.enemyShooterWidth, this.enemyShooterHeight,
                    shooter.x, shooter.y, shooter.width, shooter.height
                );
            });
        }
        // -----------------------------------------------------
    
        // --- NEW: Draw enemy shooter projectiles ---
        if (!this.game.gameOver) {
            this.enemyShooterProjectiles.forEach(projectile => {
                // First draw the particles (trail)
                projectile.particles.forEach(particle => {
                    const opacity = particle.life / particle.maxLife;
                    ctx.globalAlpha = opacity;
                    ctx.fillStyle = particle.color;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                });
                
                ctx.globalAlpha = 1.0;
                
                // Draw the fireball with gradient
                const gradient = ctx.createRadialGradient(
                    projectile.x, projectile.y, 0,
                    projectile.x, projectile.y, projectile.radius
                );
                
                gradient.addColorStop(0, 'white'); // Hot center
                gradient.addColorStop(0.3, projectile.colors.core); // Core
                gradient.addColorStop(0.7, projectile.colors.mid); // Mid layer
                gradient.addColorStop(1, projectile.colors.outer); // Outer layer
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Add glow effect
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = projectile.colors.outer;
                ctx.beginPath();
                ctx.arc(projectile.x, projectile.y, projectile.radius * 1.5, 0, Math.PI * 2);
                ctx.fill();
                
                // Add pulsing effect based on elapsed time
                const pulseSize = projectile.radius * (1 + 0.2 * Math.sin(projectile.elapsedTime * 10));
                ctx.globalAlpha = 0.15;
                ctx.fillStyle = 'rgba(255, 255, 150, 0.5)';
                ctx.beginPath();
                ctx.arc(projectile.x, projectile.y, pulseSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Reset global alpha
                ctx.globalAlpha = 1.0;
            });
        }
        // -----------------------------------------------------
    
        this.plantExplosions.forEach(explosion => {
            if (explosion.light) {
                const gradient = ctx.createRadialGradient(
                    explosion.x, explosion.y, 0,
                    explosion.x, explosion.y, explosion.light.radius
                );
                
                if (explosion.light.isElectric) {
                    // Electric light gradient
                    gradient.addColorStop(0, `rgba(100, 220, 255, ${explosion.light.intensity * 0.8})`);
                    gradient.addColorStop(0.5, `rgba(0, 180, 255, ${explosion.light.intensity * 0.4})`);
                    gradient.addColorStop(1, 'rgba(0, 50, 255, 0)');
                } else if (explosion.light.isFireball) {
                    // Fireball explosion light gradient - more intense and fiery
                    gradient.addColorStop(0, `rgba(255, 255, 255, ${explosion.light.intensity * 0.9})`); // White hot center
                    gradient.addColorStop(0.2, `rgba(255, 240, 50, ${explosion.light.intensity * 0.8})`); // Yellow
                    gradient.addColorStop(0.5, `rgba(255, 120, 0, ${explosion.light.intensity * 0.6})`);  // Orange
                    gradient.addColorStop(0.8, `rgba(255, 50, 0, ${explosion.light.intensity * 0.4})`);   // Red
                    gradient.addColorStop(1, 'rgba(100, 0, 0, 0)');  // Dark red fading to transparent
                } else {
                    // Regular explosion light gradient
                    gradient.addColorStop(0, `rgba(255, 220, 50, ${explosion.light.intensity * 0.8})`);
                    gradient.addColorStop(0.5, `rgba(255, 100, 20, ${explosion.light.intensity *.4})`);
                    gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
                }
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(explosion.x, explosion.y, explosion.light.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            if (explosion.shockwave) {
                if (explosion.shockwave.isElectric) {
                    // Electric shockwave with zigzag pattern
                    ctx.strokeStyle = `rgba(0, 200, 255, ${explosion.shockwave.life / explosion.shockwave.maxLife * 0.7})`;
                    ctx.lineWidth = 3;
                    
                    // Draw zigzag pattern around the circle
                    const segments = 18;
                    const radiusVar = explosion.shockwave.radius * 0.1;
                    
                    ctx.beginPath();
                    for (let i = 0; i <= segments; i++) {
                        const angle = (i / segments) * Math.PI * 2;
                        const radiusOffset = ((i % 2) * 2 - 1) * radiusVar;
                        const radius = explosion.shockwave.radius + radiusOffset;
                        
                        const x = explosion.shockwave.x + Math.cos(angle) * radius;
                        const y = explosion.shockwave.y + Math.sin(angle) * radius;
                        
                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.closePath();
                    ctx.stroke();
                    
                    // Add a few lightning bolts
                    const numBolts = 5;
                    for (let i = 0; i < numBolts; i++) {
                        const angle = (i / numBolts) * Math.PI * 2;
                        const boltLength = explosion.shockwave.radius * 1.3;
                        
                        ctx.beginPath();
                        ctx.moveTo(explosion.shockwave.x, explosion.shockwave.y);
                        
                        let x = explosion.shockwave.x;
                        let y = explosion.shockwave.y;
                        
                        // Draw a zigzag line
                        const zigzags = 4;
                        for (let j = 1; j <= zigzags; j++) {
                            const segmentLength = (j / zigzags) * boltLength;
                            const jitter = 10 * (j / zigzags);
                            
                            // Random zigzag
                            x = explosion.shockwave.x + Math.cos(angle) * segmentLength + 
                                (Math.random() - 0.5) * jitter * 2;
                            y = explosion.shockwave.y + Math.sin(angle) * segmentLength + 
                                (Math.random() - 0.5) * jitter * 2;
                            
                            ctx.lineTo(x, y);
                        }
                        
                        ctx.stroke();
                    }
                } else {
                    // Regular explosion shockwave
                    ctx.strokeStyle = `rgba(255, 255, 255, ${explosion.shockwave.life / explosion.shockwave.maxLife * 0.5})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(explosion.shockwave.x, explosion.shockwave.y, explosion.shockwave.radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            
            explosion.particles.forEach(particle => {
                ctx.save();
                const opacity = particle.life / particle.maxLife;
                ctx.globalAlpha = opacity;
                ctx.fillStyle = particle.color;
                
                if (particle.type === 'smoke') {
                    // Draw smoke with soft edges for fireball explosions
                    const smokeGradient = ctx.createRadialGradient(
                        particle.x, particle.y, 0, 
                        particle.x, particle.y, particle.size
                    );
                    smokeGradient.addColorStop(0, particle.color);
                    smokeGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    ctx.fillStyle = smokeGradient;
                } else if (particle.type === 'ember') {
                    // Add glow to ember particles
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = 'rgba(255, 200, 50, 0.8)';
                }
                
                // Draw different shapes based on particle type
                ctx.beginPath();
                if (particle.type === 'flame' && particle.rotation !== undefined) {
                    // Draw flame-shaped particles
                    ctx.translate(particle.x, particle.y);
                    ctx.rotate(particle.rotation);
                    
                    const flameHeight = particle.size * 1.5;
                    ctx.moveTo(0, -flameHeight/2);
                    ctx.quadraticCurveTo(flameHeight/3, -flameHeight/6, 0, flameHeight/2);
                    ctx.quadraticCurveTo(-flameHeight/3, -flameHeight/6, 0, -flameHeight/2);
                } else {
                    // Regular circular particles
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                }
                ctx.fill();
                
                // Reset shadow effects
                if (particle.type === 'ember') {
                    ctx.shadowBlur = 0;
                }
                
                ctx.restore();
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
            
            // Only show level passed message for levels 1 and 2
            if (this.level !== 3) {
                ctx.strokeText(`LEVEL ${this.level} PASSED!`, 0, 0);
                ctx.fillText(`LEVEL ${this.level} PASSED!`, 0, 0);
            }
            
            ctx.restore();
        }
        else if (this.dangerDisplayTime > 0 && !this.game.gameOver && this.gameStarted) {
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

        // Draw shockwave effect (in level 3)
        if (this.level === 3 && this.shockwaveActive) {
            // Electric arc colors
            const electricColors = ['#00FFFF', '#FFFFFF', '#80DFFF', '#4040FF', '#0080FF'];
            
            // Draw electric field boundary (outer circle)
            ctx.beginPath();
            ctx.arc(this.shockwave.x, this.shockwave.y, this.shockwave.radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#80DFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw lightning bolts emanating from center
            const numBolts = 12;
            const boltSegments = 6;
            const totalTime = Date.now() / 200; // Control the animation speed
            
            for (let i = 0; i < numBolts; i++) {
                const angle = (i / numBolts) * Math.PI * 2 + totalTime * 0.2;
                const boltLength = this.shockwave.radius * 0.9;
                
                // Start from center
                let startX = this.shockwave.x;
                let startY = this.shockwave.y;
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                
                // Draw jagged lightning path
                for (let j = 1; j <= boltSegments; j++) {
                    const segmentLength = (j / boltSegments) * boltLength;
                    const jitter = 20 * (j / boltSegments);
                    
                    // Calculate position with random jitter for jagged effect
                    const endX = this.shockwave.x + Math.cos(angle) * segmentLength + 
                                 (Math.random() - 0.5) * jitter;
                    const endY = this.shockwave.y + Math.sin(angle) * segmentLength + 
                                 (Math.random() - 0.5) * jitter;
                    
                    ctx.lineTo(endX, endY);
                    startX = endX;
                    startY = endY;
                }
                
                // Draw electric path
                ctx.strokeStyle = electricColors[i % electricColors.length];
                ctx.lineWidth = 2 + Math.random() * 2;
                ctx.globalAlpha = 0.7 + Math.random() * 0.3;
                ctx.stroke();
            }
            
            // Draw electric pulses around the boundary
            const pulseCount = 18;
            for (let i = 0; i < pulseCount; i++) {
                const pulseAngle = (i / pulseCount) * Math.PI * 2 + totalTime;
                const pulseDistance = this.shockwave.radius;
                const pulseX = this.shockwave.x + Math.cos(pulseAngle) * pulseDistance;
                const pulseY = this.shockwave.y + Math.sin(pulseAngle) * pulseDistance;
                
                // Electric pulse
                const pulseSize = 4 + Math.sin(totalTime * 3 + i) * 3;
                
                // Change color based on position to create rainbow effect
                const colorIndex = (i + Math.floor(totalTime)) % electricColors.length;
                
                ctx.beginPath();
                ctx.arc(pulseX, pulseY, pulseSize, 0, Math.PI * 2);
                ctx.fillStyle = electricColors[colorIndex];
                ctx.fill();
                
                // Add small connecting arcs around the perimeter
                if (i < pulseCount - 1) {
                    const nextAngle = ((i + 1) / pulseCount) * Math.PI * 2 + totalTime;
                    const nextX = this.shockwave.x + Math.cos(nextAngle) * pulseDistance;
                    const nextY = this.shockwave.y + Math.sin(nextAngle) * pulseDistance;
                    
                    ctx.beginPath();
                    ctx.moveTo(pulseX, pulseY);
                    
                    // Arc with jitter
                    const midAngle = (pulseAngle + nextAngle) / 2;
                    const midDistance = pulseDistance * (0.9 + Math.random() * 0.2);
                    const midX = this.shockwave.x + Math.cos(midAngle) * midDistance;
                    const midY = this.shockwave.y + Math.sin(midAngle) * midDistance;
                    
                    ctx.quadraticCurveTo(midX, midY, nextX, nextY);
                    
                    ctx.strokeStyle = electricColors[(colorIndex + 1) % electricColors.length];
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = 0.5;
                    ctx.stroke();
                }
            }
            
            // Draw center electric core
            const coreGradient = ctx.createRadialGradient(
                this.shockwave.x, this.shockwave.y, 0,
                this.shockwave.x, this.shockwave.y, this.shockwave.pulseRadius
            );
            
            coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            coreGradient.addColorStop(0.4, 'rgba(100, 200, 255, 0.7)');
            coreGradient.addColorStop(1, 'rgba(0, 120, 255, 0)');
            
            ctx.fillStyle = coreGradient;
            ctx.globalAlpha = 0.7 + Math.sin(totalTime * 5) * 0.3; // Pulsing effect
            ctx.beginPath();
            ctx.arc(this.shockwave.x, this.shockwave.y, this.shockwave.pulseRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Reset alpha
            ctx.globalAlpha = 1.0;
            
            // Draw timer display
            const timeRemaining = Math.ceil(this.shockwave.life);
            
            // Position the timer above the player
            const bird = this.getBird();
            if (bird) {
                const timerX = bird.x + this.BIRD_WIDTH / 2;
                const timerY = bird.y - 25;
                
                // Draw background for timer
                ctx.fillStyle = 'rgba(0, 40, 80, 0.7)';
                ctx.beginPath();
                ctx.roundRect(timerX - 20, timerY - 15, 40, 30, 8);
                ctx.fill();
                
                // Draw electric border
                ctx.strokeStyle = '#00FFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Add small electric accents
                for (let i = 0; i < 4; i++) {
                    const cornerX = timerX + (i % 2 === 0 ? -20 : 20);
                    const cornerY = timerY + (i < 2 ? -15 : 15);
                    
                    ctx.beginPath();
                    ctx.moveTo(cornerX, cornerY);
                    const sparkLength = 5 + Math.random() * 5;
                    const sparkAngle = (i * Math.PI / 2) + (Math.random() - 0.5) * 0.5;
                    ctx.lineTo(
                        cornerX + Math.cos(sparkAngle) * sparkLength,
                        cornerY + Math.sin(sparkAngle) * sparkLength
                    );
                    ctx.strokeStyle = electricColors[Math.floor(Math.random() * electricColors.length)];
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                
                // Draw timer text
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(timeRemaining.toString(), timerX, timerY);
                
                // Draw "SHOCK" text above timer with electric effect
                ctx.font = 'bold 12px Arial';
                ctx.fillStyle = '#00FFFF';
                ctx.fillText("SHOCK", timerX, timerY - 20);
                
                // Add glow effect to text
                ctx.shadowColor = '#00FFFF';
                ctx.shadowBlur = 5 + Math.sin(totalTime * 10) * 3;
                ctx.fillText("SHOCK", timerX, timerY - 20);
                ctx.shadowBlur = 0;
            }
        }
        if (this.gameCompleted && this.gameCompletedMessageTime > 0) {
            const alpha = Math.min(1, this.gameCompletedMessageTime * 2);
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
            ctx.strokeText('GAME COMPLETED!', 0, 0);
            ctx.fillText('GAME COMPLETED!', 0, 0);
            
            // Add a second line
            ctx.font = '30px "Press Start 2P"';
            ctx.strokeText('CONGRATULATIONS!', 0, 60);
            ctx.fillText('CONGRATULATIONS!', 0, 60);
            ctx.restore();
        }
        if (this.game.gameCompleted) {
            this.drawVictoryEffects(ctx);
        }

        // --- NEW: Draw the Dragon if it exists ---
        if (this.dragon) {
            const frameIndex = Math.floor(this.dragon.elapsedTime / this.dragonFrameDuration) % this.dragonFrameCount;
            ctx.drawImage(
                this.dragonSprite,
                frameIndex * this.dragonWidth, 0, this.dragonWidth, this.dragonHeight,
                this.dragon.x, this.dragon.y, this.dragon.width, this.dragon.height
            );
            
            // Draw dragon fireballs
            this.dragonFireballs.forEach(fireball => {
                // Save context for transformations
                ctx.save();
                
                // Draw particles first (behind the fireball)
                fireball.particles.forEach(particle => {
                    ctx.save();
                    const opacity = particle.life / particle.maxLife;
                    ctx.globalAlpha = opacity;
                    
                    if (particle.type === 'smoke') {
                        // Draw smoke with gradient
                        const smokeGradient = ctx.createRadialGradient(
                            particle.x, particle.y, 0,
                            particle.x, particle.y, particle.size
                        );
                        smokeGradient.addColorStop(0, 'rgba(150, 150, 150, 0.6)');
                        smokeGradient.addColorStop(1, 'rgba(80, 80, 80, 0)');
                        ctx.fillStyle = smokeGradient;
                    } else if (particle.type === 'ember') {
                        // Draw embers with glow
                        ctx.shadowBlur = 5;
                        ctx.shadowColor = 'rgba(255, 100, 20, 0.8)';
                        ctx.fillStyle = particle.color;
                    } else {
                        // Draw flame particles
                        ctx.fillStyle = particle.color;
                    }
                    
                    // Draw the particle (circle for most, special shape for flames)
                    ctx.beginPath();
                    if (particle.type === 'flame' && Math.random() < 0.5) {
                        // Draw flame-like shape
                        ctx.translate(particle.x, particle.y);
                        ctx.rotate(particle.rotation);
                        
                        const flameHeight = particle.size * 1.5;
                        ctx.moveTo(0, -flameHeight/2);
                        ctx.quadraticCurveTo(flameHeight/3, -flameHeight/6, 0, flameHeight/2);
                        ctx.quadraticCurveTo(-flameHeight/3, -flameHeight/6, 0, -flameHeight/2);
                    } else {
                        // Regular circle
                        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    }
                    
                    ctx.fill();
                    
                    // Reset shadow
                    if (particle.type === 'ember') {
                        ctx.shadowBlur = 0;
                    }
                    
                    ctx.restore();
                });
                
                // Center everything on the fireball center
                ctx.translate(fireball.x, fireball.y);
                
                // Apply the current size variation
                const currentRadius = fireball.originalRadius * fireball.sizeVariation;
                
                // First, draw flames extending from the main fireball
                fireball.flames.forEach(flame => {
                    // Create a cone/flame shape radiating from center
                    const flameLength = flame.currentLength;
                    
                    // Create gradient for this specific flame
                    const flameGradient = ctx.createLinearGradient(
                        0, 0,
                        Math.cos(flame.angle) * flameLength, 
                        Math.sin(flame.angle) * flameLength
                    );
                    
                    // Gradient stops for flame
                    flameGradient.addColorStop(0, fireball.colors.core);
                    flameGradient.addColorStop(0.2, fireball.colors.innerFlame);
                    flameGradient.addColorStop(0.6, fireball.colors.midFlame);
                    flameGradient.addColorStop(1, 'rgba(255, 0, 0, 0)'); // Fade to transparent
                    
                    ctx.fillStyle = flameGradient;
                    
                    // Draw flame shape as a quadratic curve
                    ctx.beginPath();
                    
                    const tipX = Math.cos(flame.angle) * flameLength;
                    const tipY = Math.sin(flame.angle) * flameLength;
                    
                    const perpAngle = flame.angle + Math.PI/2;
                    const controlWidth = flame.width * (0.7 + Math.random() * 0.6); // Fluctuating width
                    
                    const ctrlX1 = Math.cos(perpAngle) * controlWidth/2;
                    const ctrlY1 = Math.sin(perpAngle) * controlWidth/2;
                    
                    const ctrlX2 = -ctrlX1;
                    const ctrlY2 = -ctrlY1;
                    
                    // Draw the flame shape
                    ctx.moveTo(ctrlX1, ctrlY1);
                    ctx.quadraticCurveTo(tipX/2, tipY/2, tipX, tipY);
                    ctx.quadraticCurveTo(tipX/2, tipY/2, ctrlX2, ctrlY2);
                    ctx.closePath();
                    
                    ctx.fill();
                });
                
                // Now draw the main fireball in the center
                ctx.globalAlpha = 1.0;
                
                // Draw the main fireball with enhanced gradient
                const gradient = ctx.createRadialGradient(
                    0, 0, 0,
                    0, 0, currentRadius
                );
                
                gradient.addColorStop(0, fireball.colors.core); // White hot center
                gradient.addColorStop(0.2, fireball.colors.innerFlame); // Yellow
                gradient.addColorStop(0.6, fireball.colors.midFlame); // Orange
                gradient.addColorStop(1, 'rgba(255, 40, 0, 0.1)'); // Fading red
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Add glow effect
                ctx.globalAlpha = 0.4;
                ctx.shadowBlur = 30;
                ctx.shadowColor = fireball.colors.outerFlame;
                ctx.beginPath();
                ctx.arc(0, 0, currentRadius * 1.2, 0, Math.PI * 2);
                ctx.fill();
                
                // Reset shadow
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1.0;
                ctx.restore();
            });
        }
        // ---------------------------------------
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
    
        // Change the title based on whether the game was completed or not
        ctx.font = '18px "Press Start 2P", monospace';
        ctx.fillStyle = colors.title.main;
        ctx.textAlign = 'center';
        
        if (this.game.gameCompleted) {
            ctx.fillText('VICTORY!', panelX + panelWidth / 2, panelY + 30);
        } else {
            ctx.fillText('GAME OVER', panelX + panelWidth / 2, panelY + 30);
        }
    
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
    
        const menuBtnWidth = 240;
        const menuBtnHeight = 40;
        
        // Only show the restart button if the game was not completed (game over by dying)
        if (!this.game.gameCompleted) {
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
            
            // Position the menu button below the restart button
            const menuBtnX = (this.width - menuBtnWidth) / 2;
            const menuBtnY = btnY + btnHeight + 10;
            
            ctx.fillStyle = colors.fill.start;
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(menuBtnX + 10, menuBtnY);
            ctx.lineTo(menuBtnX + menuBtnWidth - 10, menuBtnY);
            ctx.quadraticCurveTo(menuBtnX + menuBtnWidth, menuBtnY, menuBtnX + menuBtnWidth, menuBtnY + 10);
            ctx.lineTo(menuBtnX + menuBtnWidth, menuBtnY + menuBtnHeight - 10);
            ctx.quadraticCurveTo(menuBtnX + menuBtnWidth, menuBtnY + menuBtnHeight, menuBtnX + menuBtnWidth - 10, menuBtnY + menuBtnHeight);
            ctx.lineTo(menuBtnX + 10, menuBtnY + menuBtnHeight);
            ctx.quadraticCurveTo(menuBtnX, menuBtnY + menuBtnHeight, menuBtnX, menuBtnY + menuBtnHeight - 10);
            ctx.lineTo(menuBtnX, menuBtnY + 10);
            ctx.quadraticCurveTo(menuBtnX, menuBtnY, menuBtnX + 10, menuBtnY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
    
            ctx.font = '16px "Press Start 2P", monospace';
            ctx.fillStyle = colors.text;
            ctx.fillText('RETURN TO MENU', menuBtnX + menuBtnWidth / 2, menuBtnY + menuBtnHeight / 2 + 8);
        } else {
            // Only show the return to menu button centered when game is completed
            const menuBtnX = (this.width - menuBtnWidth) / 2;
            const menuBtnY = panelY + panelHeight + 20; // Position it a bit lower for better spacing
            
            ctx.fillStyle = colors.fill.start;
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(menuBtnX + 10, menuBtnY);
            ctx.lineTo(menuBtnX + menuBtnWidth - 10, menuBtnY);
            ctx.quadraticCurveTo(menuBtnX + menuBtnWidth, menuBtnY, menuBtnX + menuBtnWidth, menuBtnY + 10);
            ctx.lineTo(menuBtnX + menuBtnWidth, menuBtnY + menuBtnHeight - 10);
            ctx.quadraticCurveTo(menuBtnX + menuBtnWidth, menuBtnY + menuBtnHeight, menuBtnX + menuBtnWidth - 10, menuBtnY + menuBtnHeight);
            ctx.lineTo(menuBtnX + 10, menuBtnY + menuBtnHeight);
            ctx.quadraticCurveTo(menuBtnX, menuBtnY + menuBtnHeight, menuBtnX, menuBtnY + menuBtnHeight - 10);
            ctx.lineTo(menuBtnX, menuBtnY + 10);
            ctx.quadraticCurveTo(menuBtnX, menuBtnY, menuBtnX + 10, menuBtnY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
    
            ctx.font = '16px "Press Start 2P", monospace';
            ctx.fillStyle = colors.text;
            ctx.fillText('RETURN TO MENU', menuBtnX + menuBtnWidth / 2, menuBtnY + menuBtnHeight / 2 + 8);
        }
    }

    drawVictoryEffects(ctx) {
        // Draw stars
        this.victoryEffects.stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();
        });
        
        // Draw fireworks
        this.victoryEffects.fireworks.forEach(firework => {
            if (!firework.exploded) {
                // Draw rocket
                ctx.beginPath();
                ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
                
                // Draw trail
                ctx.beginPath();
                ctx.moveTo(firework.x, firework.y);
                ctx.lineTo(firework.x - firework.vx * 3, firework.y - firework.vy * 3);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                // Draw explosion particles
                firework.particles.forEach(particle => {
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${parseInt(particle.color.slice(1, 3), 16)}, 
                                          ${parseInt(particle.color.slice(3, 5), 16)}, 
                                          ${parseInt(particle.color.slice(5, 7), 16)}, 
                                          ${particle.life})`;
                    ctx.fill();
                });
            }
        });
        
        // Draw confetti
        this.victoryEffects.confetti.forEach(confetti => {
            ctx.save();
            ctx.translate(confetti.x, confetti.y);
            ctx.rotate(confetti.rotation);
            
            ctx.fillStyle = confetti.color;
            ctx.fillRect(-confetti.size / 2, -confetti.size / 4, confetti.size, confetti.size / 2);
            
            ctx.restore();
        });
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

    activateShockwavePowerup() {
        const bird = this.getBird();
        if (!bird) return;

        this.shockwaveActive = true;
        this.shockwave.x = bird.x + this.BIRD_WIDTH / 2;
        this.shockwave.y = bird.y + this.BIRD_HEIGHT / 2;
        this.shockwave.radius = 10;
        this.shockwave.pulseRadius = 10;
        this.shockwave.life = this.shockwave.maxLife;
        
        // Sound will be added later
        /*
        if (this.shockwaveSound) {
            const shockwaveSoundClone = this.shockwaveSound.cloneNode();
            shockwaveSoundClone.volume = 0.4;
            shockwaveSoundClone.play().catch(e => console.log("Audio play failed:", e));
        }
        */
        
        // Add notification at the top of the screen - only show for 2 seconds
        this.powerUpNotification = {
            active: true,
            timer: 0,
            duration: 2, // Only show for 2 seconds
            text: "INVINCIBILITY + SHOCKWAVE ACTIVE!"
        };
    }

    updateShockwave() {
        if (!this.shockwaveActive) return;
        
        const bird = this.getBird();
        if (!bird) {
            this.shockwaveActive = false;
            return;
        }
        
        // Update shockwave position to follow the bird
        this.shockwave.x = bird.x + this.BIRD_WIDTH / 2;
        this.shockwave.y = bird.y + this.BIRD_HEIGHT / 2;
        
        // Update shockwave life
        this.shockwave.life -= this.game.clockTick;
        if (this.shockwave.life <= 0) {
            this.shockwaveActive = false;
            return;
        }
        
        // Calculate pulsing effect
        const pulseProgress = Math.sin(this.shockwave.life * this.shockwave.pulseFrequency) * 0.5 + 0.5;
        this.shockwave.pulseRadius = 30 + pulseProgress * 30;
        
        // Calculate outer radius based on lifetime (grows over time)
        const lifeProgress = 1 - (this.shockwave.life / this.shockwave.maxLife);
        this.shockwave.radius = lifeProgress * this.shockwave.maxRadius;
        
        // Repel enemy projectiles
        this.repelEnemyProjectiles();
        
        // Check for plants in shockwave radius and destroy them
        if (this.level === 3) {
            this.checkShockwavePlantCollisions();
        }
    }
    
    // New method to check collisions between shockwave and plants
    checkShockwavePlantCollisions() {
        if (!this.shockwaveActive) return;
        
        for (let i = 0; i < this.snappingPlants.length; i++) {
            const plant = this.snappingPlants[i];
            if (plant.isDead) continue;
            
            const plantWidth = this.snappingPlantFrameWidth * this.snappingPlantScale;
            const plantHeight = plant.type === "top" 
                ? this.snappingPlantTopFrameHeight * this.snappingPlantScale
                : this.snappingPlantFrameHeight * this.snappingPlantScale;
            
            // Get plant center
            const plantCenterX = plant.x + plantWidth / 2;
            const plantCenterY = plant.y + plantHeight / 2;
            
            // Calculate distance from plant center to shockwave center
            const dx = plantCenterX - this.shockwave.x;
            const dy = plantCenterY - this.shockwave.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if plant is within shockwave radius
            if (distance < this.shockwave.radius) {
                plant.isDead = true;
                plant.deadTimer = 2;
                
                // Create electric explosion effect instead of regular explosion
                this.createElectricPlantExplosion(
                    plantCenterX,
                    plantCenterY
                );
                
                if (this.plantDeathSound) {
                    const deathSound = this.plantDeathSound.cloneNode();
                    deathSound.volume = 0.4;
                    deathSound.play().catch(e => console.log("Audio play failed:", e));
                }
            }
        }
    }
    
    // New method to create an electric explosion effect for plants in level 3
    createElectricPlantExplosion(x, y) {
        const particleCount = 40 + Math.floor(Math.random() * 30);
        const particles = [];
        
        // Electric colors
        const electricColors = [
            '#00FFFF', // Cyan
            '#FFFFFF', // White
            '#80DFFF', // Light blue
            '#4040FF', // Blue
            '#0080FF'  // Medium blue
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6; // Faster particles
            const size = 2 + Math.random() * 6;
            const life = 0.5 + Math.random() * 1.5; // Longer life
            
            // Randomly select a color from the electric colors array
            const color = electricColors[Math.floor(Math.random() * electricColors.length)];
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                life: life,
                maxLife: life,
                color: color,
                isElectric: true // Mark as electric particle for special rendering
            });
        }
        
        const shockwave = {
            x: x,
            y: y,
            radius: 5,
            maxRadius: 80, // Larger radius
            life: 0.7,
            maxLife: 0.7,
            isElectric: true
        };
        
        this.plantExplosions.push({
            particles: particles,
            shockwave: shockwave,
            x: x,
            y: y,
            light: {
                radius: 100, // Larger light radius
                intensity: 1.2, // More intense
                life: 0.7,
                isElectric: true
            }
        });
    }
    
    repelEnemyProjectiles() {
        if (!this.shockwaveActive) return;
        
        const shockwave = this.shockwave;
        
        // Repel enemy shooter projectiles
        this.enemyShooterProjectiles.forEach(projectile => {
            // Calculate distance from projectile to shockwave center
            const dx = projectile.x - shockwave.x;
            const dy = projectile.y - shockwave.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if projectile is within shockwave radius
            if (distance < shockwave.radius) {
                // Calculate normalized direction vector from shockwave center to projectile
                const dirX = dx / distance;
                const dirY = dy / distance;
                
                // Calculate repulsion force (stronger as projectile gets closer to center)
                const forceFactor = 1 - (distance / shockwave.radius);
                // Increased repulsion force from 40 to 80 for more dramatic bounce effect
                const repulsionForce = 80 * forceFactor * this.game.clockTick;
                
                // Apply repulsion force to projectile velocity
                projectile.vx += dirX * repulsionForce;
                projectile.vy += dirY * repulsionForce;
                
                // Update projectile angle for visual effects
                projectile.angle = Math.atan2(projectile.vy, projectile.vx);
                
                // Add more dramatic visual effect to show repulsion
                if (Math.random() < 0.5) { // Increased particle frequency
                    projectile.particles.push({
                        x: projectile.x,
                        y: projectile.y,
                        size: 10 + Math.random() * 10, // Larger particles
                        life: 0.4, // Longer particle life
                        maxLife: 0.4,
                        vx: dirX * 3, // Faster particle movement
                        vy: dirY * 3,
                        color: shockwave.color
                    });
                }
            }
        });
        
        // Repel dragon fireballs (same logic as above)
        this.dragonFireballs.forEach(fireball => {
            // Calculate distance from fireball to shockwave center
            const dx = fireball.x - shockwave.x;
            const dy = fireball.y - shockwave.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if fireball is within shockwave radius
            if (distance < shockwave.radius) {
                // Calculate normalized direction vector from shockwave center to fireball
                const dirX = dx / distance;
                const dirY = dy / distance;
                
                // Calculate repulsion force (stronger as fireball gets closer to center)
                const forceFactor = 1 - (distance / shockwave.radius);
                // Slightly stronger repulsion for dragon fireballs since they're larger
                const repulsionForce = 90 * forceFactor * this.game.clockTick;
                
                // Apply repulsion force to fireball velocity
                fireball.vx += dirX * repulsionForce;
                fireball.vy += dirY * repulsionForce;
                
                // Update fireball angle for visual effects
                fireball.angle = Math.atan2(fireball.vy, fireball.vx);
                
                // Add more dramatic visual effect to show repulsion
                if (Math.random() < 0.6) { // Higher particle frequency for dragon fireballs
                    const size = 10 + Math.random() * 15;
                    const life = 0.5 + Math.random() * 0.2;
                    const speed = 1 + Math.random() * 2;
                    const sparkAngle = Math.random() * Math.PI * 2;
                    
                    fireball.particles.push({
                        x: fireball.x,
                        y: fireball.y,
                        size: size,
                        life: life,
                        maxLife: life,
                        vx: Math.cos(sparkAngle) * speed,
                        vy: Math.sin(sparkAngle) * speed,
                        color: Math.random() < 0.5 ? '#FFD700' : '#FF4500'
                    });
                }
            }
        });
    }

    // --- NEW: Method to spawn the Dragon for level 3 ---
    spawnDragon() {
        // Position the dragon on the right side of the screen
        const x = this.width - (this.dragonWidth * this.dragonScale) * 1.2;
        
        // Position at a middle height with some room to hover up and down
        const y = this.height / 2 - (this.dragonHeight * this.dragonScale) / 2;
        
        this.dragon = {
            x: x,
            y: y,
            width: this.dragonWidth * this.dragonScale,
            height: this.dragonHeight * this.dragonScale,
            elapsedTime: 0,
            startX: x,
            startY: y,
            hoverDirection: 1,
            hoverOffset: 0,
            horizontalDirection: -1,
            horizontalOffset: 0,
            horizontalRange: this.width * 0.3, // 30% of screen width for horizontal movement
            horizontalSpeed: 2.5,
            circleAngle: 0,
            circleRadius: 50,
            circleSpeed: 0.02,
            movementPattern: 'circle', // Options: 'hover', 'horizontal', 'circle', 'figure8'
            patternTimer: 0,
            patternDuration: 5, // Change pattern every 5 seconds
            shootTimer: 0,
            shootInterval: this.dragonFireballInterval
        };
        
        this.dangerDisplayTime = this.DANGER_DURATION;
    }
    
    // --- NEW: Method to update the Dragon ---
    updateDragon() {
        if (!this.dragon) return;
        
        // Update animation timing
        this.dragon.elapsedTime += this.game.clockTick;
        
        // Update pattern timer and potentially change patterns
        this.dragon.patternTimer += this.game.clockTick;
        if (this.dragon.patternTimer >= this.dragon.patternDuration) {
            this.dragon.patternTimer = 0;
            
            // Switch to a random movement pattern
            const patterns = ['hover', 'horizontal', 'circle', 'figure8'];
            this.dragon.movementPattern = patterns[Math.floor(Math.random() * patterns.length)];
        }
        
        // Apply the selected movement pattern
        switch (this.dragon.movementPattern) {
            case 'hover':
                // Simple up and down movement
                this.dragon.hoverOffset += this.dragonHoverSpeed * this.dragon.hoverDirection;
                
                if (Math.abs(this.dragon.hoverOffset) >= this.dragonHoverRange) {
                    this.dragon.hoverDirection *= -1;
                }
                
                this.dragon.y = this.dragon.startY + this.dragon.hoverOffset;
                break;
                
            case 'horizontal':
                // Move side to side
                this.dragon.horizontalOffset += this.dragon.horizontalSpeed * this.dragon.horizontalDirection;
                
                if (Math.abs(this.dragon.horizontalOffset) >= this.dragon.horizontalRange) {
                    this.dragon.horizontalDirection *= -1;
                }
                
                this.dragon.x = this.dragon.startX + this.dragon.horizontalOffset;
                
                // Add slight vertical movement
                this.dragon.hoverOffset += this.dragonHoverSpeed * 0.5 * this.dragon.hoverDirection;
                if (Math.abs(this.dragon.hoverOffset) >= this.dragonHoverRange) {
                    this.dragon.hoverDirection *= -1;
                }
                this.dragon.y = this.dragon.startY + this.dragon.hoverOffset;
                break;
                
            case 'circle':
                // Move in a circular pattern
                this.dragon.circleAngle += this.dragon.circleSpeed;
                
                this.dragon.x = this.dragon.startX + Math.cos(this.dragon.circleAngle) * this.dragon.circleRadius;
                this.dragon.y = this.dragon.startY + Math.sin(this.dragon.circleAngle) * this.dragon.circleRadius;
                break;
                
            case 'figure8':
                // Move in a figure-8 pattern
                this.dragon.circleAngle += this.dragon.circleSpeed;
                
                this.dragon.x = this.dragon.startX + Math.cos(this.dragon.circleAngle) * this.dragon.circleRadius;
                this.dragon.y = this.dragon.startY + Math.sin(2 * this.dragon.circleAngle) * this.dragon.circleRadius / 2;
                break;
        }
        
        // Add some randomness to make movement less predictable
        if (Math.random() < 0.01) { // 1% chance each update
            // Randomly adjust position slightly
            this.dragon.x += (Math.random() - 0.5) * 10;
            this.dragon.y += (Math.random() - 0.5) * 10;
        }
        
        // Keep dragon within screen bounds
        const minX = this.width * 0.5; // Don't go further left than middle of screen
        const maxX = this.width - this.dragon.width;
        const minY = this.dragon.height / 2;
        const maxY = this.height - this.dragon.height;
        
        this.dragon.x = Math.max(minX, Math.min(maxX, this.dragon.x));
        this.dragon.y = Math.max(minY, Math.min(maxY, this.dragon.y));
        
        // Update shooting timer
        this.dragon.shootTimer += this.game.clockTick;
        
        // Shoot fireballs periodically
        if (this.dragon.shootTimer >= this.dragon.shootInterval) {
            this.spawnDragonFireball();
            this.dragon.shootTimer = 0;
        }
        
        // Update dragon fireballs
        this.updateDragonFireballs();
    }
    
    // --- NEW: Method to spawn dragon fireballs ---
    spawnDragonFireball() {
        if (!this.dragon) return;
        
        const bird = this.getBird();
        if (!bird) return;
        
        // Get dragon mouth position (approximately left side of the dragon)
        const dragonMouthX = this.dragon.x;
        const dragonMouthY = this.dragon.y + this.dragon.height * 0.4; // Position mouth at 40% from top
        
        // Calculate bird center
        const birdLeft = bird.x + this.BIRD_X_OFFSET;
        const birdTop = bird.y + (70 * 1.2 - this.BIRD_HEIGHT) / 2;
        const birdCenterX = birdLeft + this.BIRD_WIDTH / 2;
        const birdCenterY = birdTop + this.BIRD_HEIGHT / 2;
        
        // Calculate direction to bird
        const dx = birdCenterX - dragonMouthX;
        const dy = birdCenterY - dragonMouthY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Define fireball speed
        const speed = 500; // Slightly slower than enemy shooter projectiles
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;
        
        // Create the fireball with enhanced properties for fire effect
        const fireball = {
            x: dragonMouthX,
            y: dragonMouthY,
            vx: vx * this.game.clockTick,
            vy: vy * this.game.clockTick,
            radius: 40, // Increased radius for dragon fireballs (was 25)
            angle: Math.atan2(vy, vx),
            elapsedTime: 0,
            flickerTime: 0,
            flickerRate: 0.05 + Math.random() * 0.05, // Random flicker rate for each fireball
            particles: [],
            flames: [], // New array to hold flame shapes
            colors: {
                core: '#FFFFFF', // White hot center
                innerFlame: '#FFDD00', // Yellow inner flame
                midFlame: '#FF6600', // Orange mid flame
                outerFlame: '#FF3300',  // Red outer flame
                ember: '#FF2200', // Ember color
                smoke: 'rgba(80, 80, 80, 0.5)' // Smoke color
            },
            // Store original size to allow for pulsing
            originalRadius: 40, // Increased (was 25)
            pulseAmount: 0.2,
            // Size variation for more organic look
            sizeVariation: 1.0
        };
        
        // Initialize flame particles
        this.initializeFlameShapes(fireball);
        
        this.dragonFireballs.push(fireball);
        
        // Play a fire whoosh sound if available
        if (this.fireWhooshSound) {
            const sound = this.fireWhooshSound.cloneNode();
            sound.volume = 0.3;
            sound.play();
        }
    }
    
    // NEW: Method to initialize flame shapes for the fireball
    initializeFlameShapes(fireball) {
        const flameCount = 8 + Math.floor(Math.random() * 4); // 8-11 flames
        
        for (let i = 0; i < flameCount; i++) {
            const angle = (i / flameCount) * Math.PI * 2;
            const length = fireball.radius * (0.8 + Math.random() * 0.6); // Varied lengths
            
            fireball.flames.push({
                angle: angle,
                baseLength: length,
                currentLength: length,
                width: 20 + Math.random() * 15,
                speedMultiplier: 0.8 + Math.random() * 0.4
            });
        }
    }
    
    // --- NEW: Method to update dragon fireballs ---
    updateDragonFireballs() {
        // Update each fireball position and effects
        this.dragonFireballs.forEach(fireball => {
            fireball.x += fireball.vx;
            fireball.y += fireball.vy;
            fireball.elapsedTime += this.game.clockTick;
            
            // Update flicker timing
            fireball.flickerTime += this.game.clockTick;
            if (fireball.flickerTime >= fireball.flickerRate) {
                fireball.flickerTime = 0;
                fireball.sizeVariation = 0.85 + Math.random() * 0.3; // 0.85 to 1.15 size variation
                
                // Also update flame shapes
                fireball.flames.forEach(flame => {
                    flame.currentLength = flame.baseLength * (0.8 + Math.random() * 0.4);
                    flame.angle += (Math.random() - 0.5) * 0.2; // Small angle variations
                });
            }
            
            // Add particle effects for the trail (enhanced for fire look)
            if (Math.random() < 0.7) { // More particles for dragon fireballs
                // Decide if it's smoke, ember, or flame particle
                const particleType = Math.random();
                
                let particleSize, particleLife, particleSpeed, particleColor;
                
                if (particleType < 0.6) { // 60% flame particles
                    particleSize = 6 + Math.random() * 10;
                    particleLife = 0.2 + Math.random() * 0.3;
                    particleSpeed = 0.5 + Math.random() * 1.0;
                    // Choose from flame colors
                    const flameColors = [fireball.colors.innerFlame, fireball.colors.midFlame, fireball.colors.outerFlame];
                    particleColor = flameColors[Math.floor(Math.random() * flameColors.length)];
                } else if (particleType < 0.9) { // 30% ember particles
                    particleSize = 2 + Math.random() * 4;
                    particleLife = 0.4 + Math.random() * 0.6;
                    particleSpeed = 0.8 + Math.random() * 1.5;
                    particleColor = fireball.colors.ember;
                } else { // 10% smoke particles
                    particleSize = 10 + Math.random() * 15;
                    particleLife = 0.6 + Math.random() * 0.7;
                    particleSpeed = 0.3 + Math.random() * 0.6;
                    particleColor = fireball.colors.smoke;
                }
                
                // Random offset from center with more trailing particles
                const offsetX = (Math.random() - 0.3) * fireball.radius; // More particles toward back of fireball
                const offsetY = (Math.random() - 0.5) * fireball.radius;
                
                // Calculate velocity with some randomness but mainly opposite to fireball direction
                const particleAngle = fireball.angle + Math.PI + (Math.random() - 0.5) * 0.8;
                
                fireball.particles.push({
                    x: fireball.x + offsetX,
                    y: fireball.y + offsetY,
                    size: particleSize,
                    life: particleLife,
                    maxLife: particleLife,
                    vx: Math.cos(particleAngle) * particleSpeed,
                    vy: Math.sin(particleAngle) * particleSpeed,
                    color: particleColor,
                    rotation: Math.random() * Math.PI * 2, // For non-circular particles
                    rotationSpeed: (Math.random() - 0.5) * 0.1, // For rotating particles
                    type: particleType < 0.6 ? 'flame' : (particleType < 0.9 ? 'ember' : 'smoke')
                });
            }
            
            // Update particles
            for (let i = fireball.particles.length - 1; i >= 0; i--) {
                const particle = fireball.particles[i];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life -= this.game.clockTick;
                
                // Update rotation for certain particles
                if (particle.rotation !== undefined) {
                    particle.rotation += particle.rotationSpeed;
                }
                
                // For smoke particles, grow slightly as they age
                if (particle.type === 'smoke' && particle.life < particle.maxLife * 0.7) {
                    particle.size += 0.2;
                }
                
                if (particle.life <= 0) {
                    fireball.particles.splice(i, 1);
                }
            }
        });
        
        // Remove fireballs that are off-screen
        this.dragonFireballs = this.dragonFireballs.filter(fireball => {
            return fireball.x + fireball.radius > 0 && 
                   fireball.x - fireball.radius < this.width &&
                   fireball.y + fireball.radius > 0 &&
                   fireball.y - fireball.radius < this.height;
        });
    }

    // --- NEW: Method to check collision between dragon fireball and bird ---
    checkDragonFireballCollisionWithBird(bird, fireball) {
        // Same collision detection as with projectiles
        const birdLeft = bird.x + this.BIRD_X_OFFSET;
        const birdTop = bird.y + (70 * 1.2 - this.BIRD_HEIGHT) / 2;
        
        // Bird center
        const birdCenterX = birdLeft + this.BIRD_WIDTH / 2;
        const birdCenterY = birdTop + this.BIRD_HEIGHT / 2;
        
        // Distance between centers
        const dx = fireball.x - birdCenterX;
        const dy = fireball.y - birdCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if distance is less than the sum of radii
        // Using a slightly smaller collision radius than visual radius for gameplay feel
        const collisionRadius = fireball.radius * 0.8;
        return distance < (collisionRadius + this.BIRD_WIDTH / 2);
    }

    // Method to create a fireball explosion effect when hitting the player
    createFireballExplosion(x, y) {
        const particleCount = 60 + Math.floor(Math.random() * 30); // More particles than plant explosion
        const particles = [];
        
        // Create explosion particles with fire colors
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 8; // Faster than plant particles
            const size = 3 + Math.random() * 8; // Larger particles
            const life = 0.4 + Math.random() * 1.2;
            
            // Determine particle type (flame, ember, or smoke)
            const particleType = Math.random();
            let color;
            
            if (particleType < 0.5) { // 50% flame particles
                // Fire colors - bright yellows, oranges, and reds
                const r = 200 + Math.random() * 55;
                const g = 50 + Math.random() * 150;
                const b = Math.random() * 50;
                color = `rgb(${r}, ${g}, ${b})`;
            } else if (particleType < 0.9) { // 40% ember particles
                // Embers - bright white-yellow to orange
                color = Math.random() < 0.5 ? 
                    'rgb(255, 230, 100)' : 
                    'rgb(255, 150, 50)';
            } else { // 10% smoke particles
                // Dark smoke
                const grey = 30 + Math.random() * 70;
                color = `rgba(${grey}, ${grey}, ${grey}, 0.7)`;
            }
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                life: life,
                maxLife: life,
                color: color,
                type: particleType < 0.5 ? 'flame' : (particleType < 0.9 ? 'ember' : 'smoke'),
                opacity: 1.0,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }
        
        // Create larger, more intense shockwave than plant explosion
        const shockwave = {
            x: x,
            y: y,
            radius: 5,
            maxRadius: 120, // Larger radius than plant explosion
            life: 0.7,
            maxLife: 0.7,
            color: 'rgba(255, 100, 0, 0.7)'
        };
        
        // Create brighter light effect
        const light = {
            radius: 150, // Larger light radius
            life: 0.5,
            maxLife: 0.5,
            intensity: 1.0,
            isFireball: true // Flag to use fire colors
        };
        
        // Play explosion sound with more bass/volume than plant explosion
        if (this.plantDeathSound) {
            const sound = this.plantDeathSound.cloneNode();
            sound.volume = 0.6; // Louder than plant death
            sound.play();
        }
        
        this.plantExplosions.push({
            particles: particles,
            shockwave: shockwave,
            x: x,
            y: y,
            light: light
        });
    }
}
