class Coin {
    constructor(game, x, y, pipeSpeed) { 
        this.game = game;
        this.x = x;
        this.y = y;
        this.pipeSpeed = pipeSpeed;  
        this.collected = false;
        this.animator = new Animator(
            ASSET_MANAGER.getAsset("./Sprites/Background/coin.png"),
            0, 0, 118, 130, 6, 0.1
        );
    }

    update() {
        if (!this.collected) {
            this.x -= this.pipeSpeed;  
        }
    }

    draw(ctx) {
        if (!this.collected) {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0.5);
        }
    }

    checkCollision(bird) {
        if (this.collected) return false;

        const birdWidth = 34 * 0.8;
        const birdHeight = 70 * 0.8;

        const birdLeft = bird.x + (34 * 1.2 - birdWidth) / 2;
        const birdRight = birdLeft + birdWidth;
        const birdTop = bird.y + (70 * 1.2 - birdHeight) / 2;
        const birdBottom = birdTop + birdHeight;

        const coinWidth = 50;
        const coinHeight = 50;

        const coinLeft = this.x;
        const coinRight = coinLeft + coinWidth;
        const coinTop = this.y;
        const coinBottom = coinTop + coinHeight;

        return (
            birdRight > coinLeft &&
            birdLeft < coinRight &&
            birdBottom > coinTop &&
            birdTop < coinBottom
        );
    }
}