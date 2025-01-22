class Background {
    constructor(game) {
        this.game = game;
        this.image = ASSET_MANAGER.getAsset("./Sprites/Background/Daytime.png");
        this.base = ASSET_MANAGER.getAsset("./Sprites/Background/base.png");
        this.pipeSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/bottom pipe.png");

        this.width = 800;
        this.height = 600;
        this.baseHeight = 70;
        this.baseY = this.height - this.baseHeight;

        this.pipeWidth = 50;
        this.pipeHeight = 200;
        this.pipeArray = [];
        this.pipeSpeed = 2;
        this.pipeSpacing = 200;
        this.pipeInterval = 1500;

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

        const opening = 120;
        const topPipeHeight = Math.random() * (this.baseY - this.pipeSpacing - opening);

        this.pipeArray.push({
            x: this.width,
            y: topPipeHeight - this.pipeHeight,
            width: this.pipeWidth,
            height: this.pipeHeight,
            flipped: true
        });

        this.pipeArray.push({
            x: this.width,
            y: topPipeHeight + opening,
            width: this.pipeWidth,
            height: this.baseY - (topPipeHeight + opening),
            flipped: false
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

        this.pipeArray = this.pipeArray.filter(pipe => pipe.x + pipe.width > 0);
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

        ctx.drawImage(this.base, 0, this.baseY, this.width, this.baseHeight);
    }
}

canvas.addEventListener("keydown", (e) => {
    if (e.key === " " && !background.gameStarted) {
        background.startGame();
    }
});