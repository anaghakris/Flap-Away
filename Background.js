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

        this.pipeWidth = 50;
        this.pipeHeight = 200;
        this.pipeArray = [];
        this.snappingPlants = [];
        this.pipeSpeed = 2;
        this.pipeSpacing = 200;
        this.pipeInterval = 1500;

        this.snappingPlantFrameWidth = 215; // Updated for new sprite sheet width
        this.snappingPlantFrameHeight = 360; // Updated for new sprite sheet height
        this.snappingPlantTopFrameHeight = 50;
        this.snappingPlantFrameCount = 8; // Number of frames in the sprite sheet
        this.snappingPlantFrameDuration = 0.2; // Time per frame

        this.snappingPlantScale = 0.2; // Scale the snapping plant to appear smaller

        this.gameStarted = false;
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
        if (!this.gameStarted) return;
    
        const opening = 200; // Distance between top and bottom pipes
        const topPipeHeight = Math.random() * (this.baseY - this.pipeSpacing - opening);
    
        // Top pipe
        this.pipeArray.push({
            x: this.width,
            y: topPipeHeight - this.pipeHeight,
            width: this.pipeWidth,
            height: this.pipeHeight,
            flipped: true
        });
    
        // Bottom pipe
        const bottomPipe = {
            x: this.width,
            y: topPipeHeight + opening,
            width: this.pipeWidth,
            height: this.baseY - (topPipeHeight + opening),
            flipped: false
        };
        this.pipeArray.push(bottomPipe);
    
        // Snapping plant on top of the bottom pipe
        const bottomPlantX = bottomPipe.x + (this.pipeWidth / 2) - ((this.snappingPlantFrameWidth * this.snappingPlantScale) / 2);
        const bottomPlantY = bottomPipe.y - (this.snappingPlantFrameHeight * this.snappingPlantScale);
    
        this.snappingPlants.push({
            x: bottomPlantX,
            y: bottomPlantY, // Align directly on top of the bottom pipe
            elapsedTime: 0, // Track animation time for each plant
            type: "bottom"
        });
    
        // Snapping plant below the top pipe
        const topPlantX = this.width + (this.pipeWidth / 2) - ((this.snappingPlantFrameWidth * this.snappingPlantScale) / 2);
        const topPlantY = topPipeHeight - (this.snappingPlantTopFrameHeight * this.snappingPlantScale);
    
        this.snappingPlants.push({
            x: topPlantX,
            y: topPlantY, // Align directly below the top pipe
            elapsedTime: 0, // Track animation time for each plant
            type: "top"
        });
    }
    

    setupPipeSpawning() {
        setInterval(() => {
            if (this.gameStarted) {
                this.spawnPipePair();
            }
        }, this.pipeInterval);
    }

    update() {
        if (!this.gameStarted) return;

        this.pipeArray.forEach(pipe => {
            pipe.x -= this.pipeSpeed;
        });

        this.snappingPlants.forEach(plant => {
            plant.x -= this.pipeSpeed;
            plant.elapsedTime += this.game.clockTick; // Update animation time
        });

        this.pipeArray = this.pipeArray.filter(pipe => pipe.x + pipe.width > 0);
        this.snappingPlants = this.snappingPlants.filter(plant => plant.x + (this.snappingPlantFrameWidth * this.snappingPlantScale) > 0); // Filter snapping plants
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
                    0, 0, 50, 200,
                    -pipe.width / 2, -pipe.height / 2, pipe.width, pipe.height
                );
                ctx.restore();
            } else {
                ctx.drawImage(this.pipeSprite, 0, 0, 50, 200, pipe.x, pipe.y, pipe.width, pipe.height);
            }
        });
    
        this.snappingPlants.forEach(plant => {
            const frame = Math.floor(plant.elapsedTime / this.snappingPlantFrameDuration) % this.snappingPlantFrameCount;
            const sprite = plant.type === "bottom" ? this.snappingPlantSprite : this.snappingPlantTop;
    
            ctx.drawImage(
                sprite,
                frame * this.snappingPlantFrameWidth, 0, // Source X and Y
                this.snappingPlantFrameWidth, this.snappingPlantFrameHeight, // Source width and height
                plant.x, plant.y, // Destination X and Y
                this.snappingPlantFrameWidth * this.snappingPlantScale, this.snappingPlantFrameHeight * this.snappingPlantScale // Destination width and height
            );
        });
    
        ctx.drawImage(this.base, 0, this.baseY, this.width, this.baseHeight);
    }
    
}

canvas.addEventListener("keydown", (e) => {
    if (e.key === " " && !background.gameStarted) {
        background.startGame();
    }
});
