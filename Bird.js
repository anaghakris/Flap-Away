class Bird {
    constructor(game) {
        this.game = game;
        this.animator = new Animator(
            ASSET_MANAGER.getAsset("./Sprites/Bird/yellowbird-sprite-sheet.png"),
            0, 0, 34, 70, 3, 0.2
        );
        this.x = 200; 
        this.y = 300; 
        this.velocity = 0; 
        this.gravity = 0.5;
        this.lift = -10; 
        this.gameStarted = false; 
    }

    startGame() {
        this.gameStarted = true; 
    }

    update() {
        if (!this.gameStarted) return; 

        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.game.keys[" "]) {
            this.velocity = this.lift; 
        }

        if (this.y < 0) this.y = 0; 
        if (this.y > 565 - 70) { 
            this.y = 565 - 70;
            this.velocity = 0;

            game.gameOver = true;
        }
    }

    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
    }
}