class Bird {
    constructor(game) {
        this.game = game;
        this.animator = new Animator(ASSET_MANAGER.getAsset("./Sprites/Bird/yellowbird-sprite-sheet.png"), 0, 0, 34, 70, 3, 0.2);
    };

    update() {
        
    };

    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, 400, 300, 2);
    };
};