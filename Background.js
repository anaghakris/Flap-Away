class Background {
    constructor(game) {
        this.game = game;
        this.image = ASSET_MANAGER.getAsset("./Sprites/Background/Daytime.png");
        this.base = ASSET_MANAGER.getAsset("./Sprites/Background/base.png");
        this.width = 800;
        this.height = 600;
        this.baseHeight = 70;
        this.baseY = this.height - this.baseHeight;

        this.pipeSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/bottom pipe.png");
        this.pipeX = 380;
        this.pipeY = this.baseY - 200;
        this.pipeWidth = 50; 
        this.pipeHeight = 200;

        this.reflectedPipeY = this.baseY - this.pipeHeight - 350;
    }

    update() {
    }

    draw(ctx) {
        ctx.drawImage(this.image, 0, 0, this.width, this.height);

        ctx.drawImage(this.base, 0, this.baseY, this.width, this.baseHeight);

        ctx.drawImage(
            this.pipeSprite,
            0, 0, 50, 200, 
            this.pipeX, this.pipeY, this.pipeWidth, this.pipeHeight 
        );

        ctx.save(); 

        ctx.translate(this.pipeX + this.pipeWidth / 2, this.reflectedPipeY + this.pipeHeight / 2);

        ctx.rotate(Math.PI); 

        ctx.drawImage(
            this.pipeSprite,
            0, 0, 50, 200, 
            -this.pipeWidth / 2, -this.pipeHeight / 2, this.pipeWidth, this.pipeHeight 
        );

        ctx.restore(); 
    }
}
