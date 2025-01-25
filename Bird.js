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
        this.gravity = 0.3;  
        this.lift = -4.8;   
        this.rotation = 0;
        this.maxRotationDown = Math.PI / 2;
        this.maxRotationUp = -Math.PI / 8;
        this.gameStarted = false;
        this.smoothingFactor = 0.15;
    }

    startGame() {
        this.gameStarted = true;
    }

    update() {
        if (!this.gameStarted) return;

        this.velocity += this.gravity;
        this.velocity *= 0.95;
        this.y += this.velocity;

        if (this.game.keys[" "]) {
            this.velocity = this.lift;
        }

        const targetRotation = this.velocity > 0 
            ? Math.min(this.maxRotationDown, this.velocity / 8)
            : Math.max(this.maxRotationUp, this.velocity / 8);
            
        this.rotation += (targetRotation - this.rotation) * this.smoothingFactor;

        if (this.y < 0) this.y = 0;
        if (this.y > 565 - 70) {
            this.y = 565 - 70;
            this.velocity = 0;
            this.rotation = this.maxRotationDown;
            game.gameOver = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + 34 / 2, this.y + 70 / 2);
        ctx.rotate(this.rotation);
        ctx.translate(-(this.x + 34 / 2), -(this.y + 70 / 2));
        const scale = 0.6;
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2 * scale);
        ctx.restore();
    }
}