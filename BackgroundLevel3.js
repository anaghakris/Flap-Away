class BackgroundLevel3 extends BaseBackground {
    constructor(game) {
        const assets = {
            background: "./Sprites/Background/Retro.png", 
            base: "./Sprites/Background/level3base.png",
            pipe: "./Sprites/Pipes/level3pipe.png",
            topPipe: "./Sprites/Pipes/level3pipe.png"
        };
        super(game, 3, assets);

        let bird = this.getBird();
        if (bird) {
            bird.sprite = ASSET_MANAGER.getAsset("./Sprites/Bird/redbird_sprite_sheet.png");

        }

        const coinType = game.selectedCoinType || 'default';
        let coinCount = coinType === 'custom' ? 2 : 20; 
        this.coinProgress = new CoinProgress(game, 800, coinCount);

        this.levelTitleAnimation = {
            active: true,
            timer: 0,
            duration: 2,
            scale: 0,
            opacity: 0,
            y: this.game.ctx.canvas.height / 2
        };
    }

    updateBestScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('flappyBestScore', this.bestScore);
        }
    }

    update() {
        super.update();
        this.updateBestScore();
    }

    draw(ctx) {
        super.draw(ctx);
        this.drawLevelTitle(ctx, "LEVEL 3");
    }

    drawLevelTitle(ctx, text) {
        if (this.levelTitleAnimation.active) {
            this.levelTitleAnimation.timer += this.game.clockTick;
            const progress = this.levelTitleAnimation.timer / this.levelTitleAnimation.duration;

            if (progress <= 0.3) {
                this.levelTitleAnimation.scale = progress * 3.3;
                this.levelTitleAnimation.opacity = progress * 3.3;
            } else if (progress <= 0.7) {
                this.levelTitleAnimation.scale = 1;
                this.levelTitleAnimation.opacity = 1;
            } else if (progress < 1) {
                this.levelTitleAnimation.opacity = 1 - ((progress - 0.7) * 3.3);
            } else {
                this.levelTitleAnimation.active = false;
                return;
            }

            ctx.save();
            ctx.globalAlpha = this.levelTitleAnimation.opacity;
            ctx.font = "bold 80px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const centerX = ctx.canvas.width / 2;
            const centerY = this.levelTitleAnimation.y;
            ctx.translate(centerX, centerY);
            ctx.scale(this.levelTitleAnimation.scale, this.levelTitleAnimation.scale);
            ctx.translate(-centerX, -centerY);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 8;
            ctx.strokeText(text, centerX, centerY);
            ctx.fillStyle = "#FFD700";
            ctx.fillText(text, centerX, centerY);
            ctx.shadowColor = "#FFD700";
            ctx.shadowBlur = 20;
            ctx.fillText(text, centerX, centerY);
            ctx.restore();
        }
    }
}
