class Background {
    constructor(game) {
        this.game = game;
        this.image = ASSET_MANAGER.getAsset("./Sprites/Background/Daytime.png");
        this.base = ASSET_MANAGER.getAsset("./Sprites/Background/base.png");
        this.width = 800; 
        this.height = 600; 
        this.baseHeight = 70; 
        this.baseY = this.height - this.baseHeight; 
    }

    update() {

    }

    draw(ctx) {
        ctx.drawImage(this.image, 0, 0, this.width, this.height);

        ctx.drawImage(this.base, 0, this.baseY, this.width, this.baseHeight);
    }
}

