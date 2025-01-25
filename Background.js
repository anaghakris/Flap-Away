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
        this.snappingPlantTopFrameHeight = 90;
        this.snappingPlantFrameCount = 8; // Number of frames in the sprite sheet
        this.snappingPlantFrameDuration = 0.2; // Time per frame

        this.snappingPlantScale = 0.2; // Scale the snapping plant to appear smaller

        this.gameStarted = false;
        this.pipePairCount = 0; // Counter to track pipe pair spawning
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
            const bottomPlantX = bottomPipe.x + (this.pipeWidth / 2) - ((this.snappingPlantFrameWidth * this.snappingPlantScale) / 2);
            const bottomPlantY = bottomPipe.y - (this.snappingPlantFrameHeight * this.snappingPlantScale);
            
            const bottomDelay = Math.random() * 3;
            
            this.snappingPlants.push({
                x: bottomPlantX,
                y: bottomPlantY,
                elapsedTime: -bottomDelay,
                type: "bottom"
            });
    
            const topPlantX = this.width + (this.pipeWidth / 2) - ((this.snappingPlantFrameWidth * this.snappingPlantScale) / 2);
            const topPlantY = topPipeHeight - this.snappingPlantTopFrameHeight * this.snappingPlantScale + 10;
            
            const topDelay = Math.random() * 5;
            
            this.snappingPlants.push({
                x: topPlantX,
                y: topPlantY,
                elapsedTime: -topDelay,  
                type: "top"
            });
        }
    
        this.pipePairCount++;
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
            plant.elapsedTime += this.game.clockTick; 
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
    
        ctx.drawImage(this.base, 0, this.baseY, this.width, this.baseHeight);
    }
}

canvas.addEventListener("keydown", (e) => {
    if (e.key === " " && !background.gameStarted) {
        background.startGame();
    }
});
