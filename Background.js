class Background {
    constructor(game) {
        this.game = game;
        this.image = ASSET_MANAGER.getAsset("./Sprites/Background/Daytime.png");
        this.width = 800; 
        this.height = 600; 
    }

    update() {
    }

    draw(ctx) {
        ctx.drawImage(this.image, 0, 0, this.width, this.height);
    }
}
