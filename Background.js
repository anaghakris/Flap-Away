class Background {
    constructor(game) {
        this.game = game;
        this.image = ASSET_MANAGER.getAsset("./Sprites/Background/Daytime.png");
        this.coin = ASSET_MANAGER.getAsset("./Sprites/Background/coin.png");
        this.base = ASSET_MANAGER.getAsset("./Sprites/Background/base.png");
        this.pipeSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/bottom pipe.png");
        this.snappingPlantSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/SnappingPlant.png");
        this.snappingPlantTop = ASSET_MANAGER.getAsset("./Sprites/Pipes/snapping plants top.png");
        this.pointSound = ASSET_MANAGER.getAsset("./audio/sfx_point.wav");
        this.hitSound = ASSET_MANAGER.getAsset("./audio/sfx_hit.wav");

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
        this.pipeInterval = 1500;

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

        this.SHOW_HITBOXES = true;
        this.BIRD_WIDTH = 34 * 0.7;
        this.BIRD_HEIGHT = 70 * 0.7;
        this.BIRD_X_OFFSET = 10;
        this.PIPE_HORIZONTAL_PADDING = 8;
        this.PIPE_VERTICAL_PADDING = 10;
        this.PLANT_COLLISION_WIDTH_FACTOR = 0.5;
        this.PLANT_COLLISION_HEIGHT_FACTOR = 0.4;
    }

    reset() {
        this.pipeArray = [];
        this.snappingPlants = [];
        this.gameStarted = false;
        this.pipePairCount = 0;
        
        if (this.pipeSpawnInterval) {
            clearInterval(this.pipeSpawnInterval);
        }
        this.setupPipeSpawning();
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
        const topPipeHeight = Math.random() * (this.baseY - this.pipeSpacing - opening);
    
        const topPipe = {
            x: this.width,
            y: topPipeHeight - this.pipeHeight,
            width: this.pipeWidth,
            height: this.pipeHeight,
            flipped: true,
            passed: false
        };
        this.pipeArray.push(topPipe);
    
        const bottomPipe = {
            x: this.width,
            y: topPipeHeight + opening,
            width: this.pipeWidth,
            height: this.baseY - (topPipeHeight + opening),
            flipped: false,
            passed: false
        };
        this.pipeArray.push(bottomPipe);
    
        // More random coin spawning - one coin per pipe area
        // Random x position in the area between current and next pipe
        const coinX = topPipe.x + this.pipeWidth + Math.random() * (this.pipeWidth * 2);
        
        // Much more random y position - can be anywhere from near top of screen to just above base
        const maxY = this.baseY - 50; // Keep some distance from the base
        const minY = 50; // Keep some distance from the top
        const coinY = minY + Math.random() * (maxY - minY);
    
        this.coins.push({
            x: coinX,
            y: coinY,
            animator: new Animator(
                ASSET_MANAGER.getAsset("./Sprites/Background/coin.png"),
                0, 0, 118, 130, 6, 0.1
            ),
            collected: false
        });
    
        if (this.pipePairCount % 2 === 0) {
            const addTopPlant = Math.random() < 0.5;
    
            if (addTopPlant) {
                const topPlantX = this.width + (this.pipeWidth / 2) -
                    ((this.snappingPlantFrameWidth * this.snappingPlantScale) / 2);
                const topPlantY = topPipeHeight - this.snappingPlantTopFrameHeight *
                    this.snappingPlantScale + 18;
                const topDelay = Math.random() * 3;
    
                this.snappingPlants.push({
                    x: topPlantX,
                    y: topPlantY,
                    elapsedTime: -topDelay,
                    type: "top"
                });
            } else {
                const bottomPlantX = bottomPipe.x + (this.pipeWidth / 2) -
                    ((this.snappingPlantFrameWidth * this.snappingPlantScale) / 2);
                const bottomPlantY = bottomPipe.y -
                    (this.snappingPlantFrameHeight * this.snappingPlantScale);
                const bottomDelay = Math.random() * 1;
    
                this.snappingPlants.push({
                    x: bottomPlantX,
                    y: bottomPlantY,
                    elapsedTime: -bottomDelay,
                    type: "bottom"
                });
            }
        }
    
        this.pipePairCount++;
    }

    update() {
        if (!this.gameStarted || this.game.gameOver) return;

        this.pipeArray.forEach(pipe => {
            pipe.x -= this.pipeSpeed;
        });

        this.snappingPlants.forEach(plant => {
            plant.x -= this.pipeSpeed;
            plant.elapsedTime += this.game.clockTick;
        });

        // Update coin positions
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.x -= this.pipeSpeed;
            }
        });

        const bird = this.getBird();
        if (bird) {
            this.pipeArray.forEach(pipe => {
                if (!pipe.passed && bird.x > pipe.x + pipe.width && pipe.flipped) {
                    pipe.passed = true;
                    bird.score++;
                    if (this.pointSound) {
                        this.pointSound.currentTime = 0;
                        this.pointSound.play();
                    }
                }
            });

            for (const pipe of this.pipeArray) {
                if (this.checkCollision(bird, pipe)) {
                    if (this.hitSound) {
                        this.hitSound.currentTime = 0;
                        this.hitSound.play();
                    }
                    this.game.gameOver = true;
                    bird.velocity = 0;
                    bird.rotation = bird.maxRotationDown;
                    break;
                }
            }

            for (const plant of this.snappingPlants.filter(plant => plant.elapsedTime >= 0)) {
                if (this.checkPlantCollision(bird, plant)) {
                    if (this.hitSound) {
                        this.hitSound.currentTime = 0;
                        this.hitSound.play();
                    }
                    this.game.gameOver = true;
                    bird.velocity = 0;
                    bird.rotation = bird.maxRotationDown;
                    break;
                }
            }

            // Check coin collisions
            this.coins.forEach(coin => {
                if (!coin.collected && this.checkCoinCollision(bird, coin)) {
                    coin.collected = true;
                }
            });
        }

        this.pipeArray = this.pipeArray.filter(pipe => pipe.x + pipe.width > 0);
        this.snappingPlants = this.snappingPlants.filter(plant => {
            const isOnScreen = plant.x + (this.snappingPlantFrameWidth * this.snappingPlantScale) > 0;
            const hasCompletedAnimation = plant.elapsedTime >= 0 &&
                plant.elapsedTime > this.snappingPlantFrameDuration * this.snappingPlantFrameCount;
            return isOnScreen && !hasCompletedAnimation;
        });
        this.coins = this.coins.filter(coin => 
            !coin.collected && coin.x + 50 > 0 
        );
    }

    getBird() {
        return this.game.entities.find(entity => entity instanceof Bird) || null;
    }

    checkCollision(bird, pipe) {
        const birdLeft = bird.x + this.BIRD_X_OFFSET;
        const birdRight = birdLeft + this.BIRD_WIDTH;
        const birdTop = bird.y + (70 * 1.2 - this.BIRD_HEIGHT) / 2;
        const birdBottom = birdTop + this.BIRD_HEIGHT;

        const pipeLeft = pipe.x + this.PIPE_HORIZONTAL_PADDING;
        const pipeRight = pipe.x + pipe.width - this.PIPE_HORIZONTAL_PADDING;
        const pipeTop = pipe.y + (pipe.flipped ? this.PIPE_VERTICAL_PADDING : 0);
        const pipeBottom = pipe.y + pipe.height - (pipe.flipped ? 0 : this.PIPE_VERTICAL_PADDING);

        return (
            birdRight > pipeLeft &&
            birdLeft < pipeRight &&
            birdBottom > pipeTop &&
            birdTop < pipeBottom
        );
    }

    checkPlantCollision(bird, plant) {
        if (plant.elapsedTime < 0) return false;
        
        const frame = Math.floor(plant.elapsedTime / this.snappingPlantFrameDuration) % 
            this.snappingPlantFrameCount;
        
        if (frame < 2 || frame > 4) return false;

        const birdLeft = bird.x + this.BIRD_X_OFFSET;
        const birdRight = birdLeft + this.BIRD_WIDTH;
        const birdTop = bird.y + (70 * 1.2 - this.BIRD_HEIGHT) / 2;
        const birdBottom = birdTop + this.BIRD_HEIGHT;

        const plantScale = this.snappingPlantScale;
        const collisionWidth = this.snappingPlantFrameWidth * plantScale * 
            this.PLANT_COLLISION_WIDTH_FACTOR;
        const collisionHeight = this.snappingPlantFrameHeight * plantScale * 
            this.PLANT_COLLISION_HEIGHT_FACTOR;
        
        const plantCollisionX = plant.x + 
            (this.snappingPlantFrameWidth * plantScale - collisionWidth) / 2;
        const plantCollisionY = plant.type === "top" 
            ? plant.y + this.snappingPlantTopFrameHeight * plantScale - collisionHeight
            : plant.y + (this.snappingPlantFrameHeight * plantScale - collisionHeight) * 0.8;

        return (
            birdRight > plantCollisionX &&
            birdLeft < plantCollisionX + collisionWidth &&
            birdBottom > plantCollisionY &&
            birdTop < plantCollisionY + collisionHeight
        );
    }
    checkCoinCollision(bird, coin) {
        const birdWidth = 34 * 0.8;
        const birdHeight = 70 * 0.8;
    
        const birdLeft = bird.x + (34 * 1.2 - birdWidth) / 2;
        const birdRight = birdLeft + birdWidth;
        const birdTop = bird.y + (70 * 1.2 - birdHeight) / 2;
        const birdBottom = birdTop + birdHeight;
    
        const coinWidth = 50;  
        const coinHeight = 50; 
    
        const coinLeft = coin.x;
        const coinRight = coinLeft + coinWidth;
        const coinTop = coin.y;
        const coinBottom = coinTop + coinHeight;
    
        return (
            birdRight > coinLeft &&
            birdLeft < coinRight &&
            birdBottom > coinTop &&
            birdTop < coinBottom
        );
    }

    draw(ctx) {
        ctx.drawImage(this.image, 0, 0, this.width, this.height);

        this.pipeArray.forEach(pipe => {
            if (pipe.flipped) {
                ctx.save();
                ctx.translate(pipe.x + pipe.width / 2, pipe.y + pipe.height / 2);
                ctx.scale(1, -1);
                ctx.drawImage(
                    this.pipeSprite,
                    0, 0, 55, 200,
                    -pipe.width / 2, -pipe.height / 2, pipe.width, pipe.height
                );
                ctx.restore();
            } else {
                ctx.drawImage(
                    this.pipeSprite,
                    0, 0, 55, 200,
                    pipe.x, pipe.y, pipe.width, pipe.height
                );
            }

            if (this.SHOW_HITBOXES) {
                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                const hbx = pipe.x + this.PIPE_HORIZONTAL_PADDING;
                const hby = pipe.y + (pipe.flipped ? this.PIPE_VERTICAL_PADDING : 0);
                const hbw = pipe.width - (2 * this.PIPE_HORIZONTAL_PADDING);
                const hbh = pipe.height - (pipe.flipped ? this.PIPE_VERTICAL_PADDING : 0);
                ctx.strokeRect(hbx, hby, hbw, hbh);
            }
        });
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.animator.drawFrame(this.game.clockTick, ctx, coin.x, coin.y, 0.5);
            }
        });

        this.snappingPlants.forEach(plant => {
            if (plant.elapsedTime < 0) return;

            const frame = Math.floor(plant.elapsedTime / this.snappingPlantFrameDuration) %
                this.snappingPlantFrameCount;
            const sprite = plant.type === "bottom" ?
                this.snappingPlantSprite : this.snappingPlantTop;

            ctx.drawImage(
                sprite,
                frame * this.snappingPlantFrameWidth, 0,
                this.snappingPlantFrameWidth, this.snappingPlantFrameHeight,
                plant.x, plant.y,
                this.snappingPlantFrameWidth * this.snappingPlantScale,
                this.snappingPlantFrameHeight * this.snappingPlantScale
            );

            if (this.SHOW_HITBOXES && frame >= 2 && frame <= 4) {
                const plantScale = this.snappingPlantScale;
                const collisionWidth = this.snappingPlantFrameWidth * plantScale * 
                    this.PLANT_COLLISION_WIDTH_FACTOR;
                const collisionHeight = this.snappingPlantFrameHeight * plantScale * 
                    this.PLANT_COLLISION_HEIGHT_FACTOR;
                
                const plantCollisionX = plant.x + 
                    (this.snappingPlantFrameWidth * plantScale - collisionWidth) / 2;
                const plantCollisionY = plant.type === "top" 
                    ? plant.y + this.snappingPlantTopFrameHeight * plantScale - collisionHeight
                    : plant.y + (this.snappingPlantFrameHeight * plantScale - collisionHeight) * 0.8;

                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                ctx.strokeRect(plantCollisionX, plantCollisionY, collisionWidth, collisionHeight);
            }
        });

        ctx.drawImage(this.base, 0, this.baseY, this.width, this.baseHeight);

        if (this.game.gameOver) {
            ctx.font = "48px Arial";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.textAlign = "center";
            ctx.strokeText("Game Over", this.width / 2, this.height / 2);
            ctx.fillText("Game Over", this.width / 2, this.height / 2);
            ctx.font = "24px Arial";
            ctx.strokeText("Press Space to Restart", this.width / 2, this.height / 2 + 40);
            ctx.fillText("Press Space to Restart", this.width / 2, this.height / 2 + 40);
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