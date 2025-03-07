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
            bird.invincible = false;
            bird.invincibleTimer = 0;
            if (bird.powerSoundLoop) {
                bird.powerSoundLoop.pause();
                bird.powerSoundLoop = null;
            }
            
            bird.sprite = ASSET_MANAGER.getAsset("./Sprites/Bird/redbird_sprite_sheet.png");

        }

        const coinType = game.selectedCoinType || 'default';
        let coinCount = coinType === 'custom' ? 2 : 10; 
        this.coinProgress = new CoinProgress(game, 800, coinCount);

        this.levelTitleAnimation = {
            active: true,
            timer: 0,
            duration: 2,
            scale: 0,
            opacity: 0,
            y: this.game.ctx.canvas.height / 2
        };
        
        // Add notification about shockwave and invincibility powerups
        this.powerUpNotification = {
            active: true,
            timer: 0,
            duration: 5,
            text: "COLLECT COINS FOR INVINCIBILITY + SHOCKWAVE!"
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
        
        // Update powerup notification
        if (this.powerUpNotification && this.powerUpNotification.active) {
            this.powerUpNotification.timer += this.game.clockTick;
            if (this.powerUpNotification.timer >= this.powerUpNotification.duration) {
                this.powerUpNotification.active = false;
            }
        }
    }

    draw(ctx) {
        super.draw(ctx);
        this.drawLevelTitle(ctx, "LEVEL 3");
        
        // Draw powerup notification
        if (this.powerUpNotification && this.powerUpNotification.active) {
            const alpha = Math.min(1, this.powerUpNotification.timer * 2);
            let fadeAlpha = 1;
            
            if (this.powerUpNotification.timer > this.powerUpNotification.duration - 0.5) {
                fadeAlpha = (this.powerUpNotification.duration - this.powerUpNotification.timer) * 2;
            }
            
            ctx.save();
            ctx.globalAlpha = fadeAlpha;
            
            const boxWidth = 500;
            const boxHeight = 60;
            const boxX = (ctx.canvas.width - boxWidth) / 2;
            const boxY = 50;
            
            ctx.shadowColor = 'rgba(0, 150, 255, 0.8)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            ctx.fillStyle = 'rgba(0, 50, 100, 0.7)';
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = 'rgba(0, 100, 255, 0.8)';
            ctx.shadowBlur = 8;
            
            const pulse = 1 + Math.sin(this.powerUpNotification.timer * 8) * 0.1;
            ctx.save();
            ctx.translate(ctx.canvas.width / 2, boxY + boxHeight / 2);
            ctx.scale(pulse, pulse);
            ctx.fillText(this.powerUpNotification.text, 0, 0);
            ctx.restore();
            
            ctx.restore();
        }
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
