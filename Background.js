class Background {
    constructor(game) {
        this.game = game;
        this.image = ASSET_MANAGER.getAsset("./Sprites/Background/Daytime.png");
        this.base = ASSET_MANAGER.getAsset("./Sprites/Background/base.png");
        this.pipeSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/bottom pipe.png");
        this.snappingPlantSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/SnappingPlant.png");
        this.snappingPlantTop = ASSET_MANAGER.getAsset("./Sprites/Pipes/snapping plants top.png");

        this.width = 800;
        this.height = 600;
        this.baseHeight = 70;
        this.baseY = this.height - this.baseHeight;

        this.pipeWidth = 80;
        this.pipeHeight = 200;
        this.pipeArray = [];
        this.snappingPlants = [];
        this.pipeSpeed = 5;
        this.pipeSpacing = 200;
        this.pipeInterval = 1500;

        this.snappingPlantFrameWidth = 215;
        this.snappingPlantFrameHeight = 360;
        this.snappingPlantTopFrameHeight = 90;
        this.snappingPlantFrameCount = 8;
        this.snappingPlantFrameDuration = 0.4;

        this.snappingPlantScale = 0.2;

        this.gameStarted = false;
        this.pipePairCount = 0;
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

    spawnPipePair() {
        if (!this.gameStarted || this.game.gameOver) return;

        const opening = 200;
        const topPipeHeight = Math.random() * (this.baseY - this.pipeSpacing - opening);

        this.pipeArray.push({
            x: this.width,
            y: topPipeHeight - this.pipeHeight,
            width: this.pipeWidth,
            height: this.pipeHeight,
            flipped: true
        });

        const bottomPipe = {
            x: this.width,
            y: topPipeHeight + opening,
            width: this.pipeWidth,
            height: this.baseY - (topPipeHeight + opening),
            flipped: false
        };
        this.pipeArray.push(bottomPipe);

        if (this.pipePairCount % 2 === 0) {
            const addTopPlant = Math.random() < 0.5;

            if (addTopPlant) {
                // Add top plant
                const topPlantX = this.width + (this.pipeWidth / 2) - 
                    ((this.snappingPlantFrameWidth * this.snappingPlantScale) / 2);
                const topPlantY = topPipeHeight - this.snappingPlantTopFrameHeight * 
                    this.snappingPlantScale + 10;
                const topDelay = Math.random() * 3;

                this.snappingPlants.push({
                    x: topPlantX,
                    y: topPlantY,
                    elapsedTime: -topDelay,
                    type: "top"
                });
            } else {
                // Add bottom plant
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

    setupPipeSpawning() {
        setInterval(() => {
            if (this.gameStarted && !this.game.gameOver) {
                this.spawnPipePair();
            }
        }, this.pipeInterval);
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

        const bird = this.getBird();
        if (bird) {
            for (const pipe of this.pipeArray) {
                if (this.checkCollision(bird, pipe)) {
                    this.game.gameOver = true;
                    bird.velocity = 0;
                    bird.rotation = bird.maxRotationDown;
                    break;
                }
            }

            // Only check collision for plants that are actively animating
            for (const plant of this.snappingPlants.filter(plant => plant.elapsedTime >= 0)) {
                if (this.checkPlantCollision(bird, plant)) {
                    this.game.gameOver = true;
                    bird.velocity = 0;
                    bird.rotation = bird.maxRotationDown;
                    break;
                }
            }
        }

        this.pipeArray = this.pipeArray.filter(pipe => pipe.x + pipe.width > 0);
        this.snappingPlants = this.snappingPlants.filter(plant => 
            plant.x + (this.snappingPlantFrameWidth * this.snappingPlantScale) > 0
        );
    }

    getBird() {
        for (const entity of this.game.entities) {
            if (entity instanceof Bird) {
                return entity;
            }
        }
        return null;
    }

    checkCollision(bird, pipe) {
        const birdWidth = 34 * 1.2;
        const birdHeight = 70 * 1.2;

        const birdLeft = bird.x;
        const birdRight = bird.x + birdWidth;
        const birdTop = bird.y;
        const birdBottom = bird.y + birdHeight;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + pipe.width;
        const pipeTop = pipe.y;
        const pipeBottom = pipe.y + pipe.height;

        return (
            birdRight > pipeLeft &&
            birdLeft < pipeRight &&
            birdBottom > pipeTop &&
            birdTop < pipeBottom
        );
    }

    checkPlantCollision(bird, plant) {
        const birdWidth = 34 * 1.2;
        const birdHeight = 70 * 1.2;

        const birdLeft = bird.x;
        const birdRight = bird.x + birdWidth;
        const birdTop = bird.y;
        const birdBottom = bird.y + birdHeight;

        const plantWidth = this.snappingPlantFrameWidth * this.snappingPlantScale;
        const plantHeight = this.snappingPlantFrameHeight * this.snappingPlantScale;

        const plantLeft = plant.x;
        const plantRight = plant.x + plantWidth;
        const plantTop = plant.y;
        const plantBottom = plant.y + plantHeight;

        return (
            birdRight > plantLeft &&
            birdLeft < plantRight &&
            birdBottom > plantTop &&
            birdTop < plantBottom
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
        });

        if (this.game.options.debugging) {
            this.pipeArray.forEach(pipe => {
                ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    pipe.x + 10,
                    pipe.y,
                    pipe.width - 20,
                    pipe.height
                );
            });

            // Debugging for snapping plants
            this.snappingPlants
                .filter(plant => plant.elapsedTime >= 0)
                .forEach(plant => {
                    const plantWidth = this.snappingPlantFrameWidth * this.snappingPlantScale;
                    const plantHeight = this.snappingPlantFrameHeight * this.snappingPlantScale;

                    ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(plant.x, plant.y, plantWidth, plantHeight);
                });
        }

        ctx.drawImage(this.base, 0, this.baseY, this.width, this.baseHeight);
    }
}
