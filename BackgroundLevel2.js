class BackgroundLevel2 extends BaseBackground {
    constructor(game) {
        const assets = {
            background: "./Sprites/Background/NightCity.png",
            base: "./Sprites/Background/base_night.png",
            pipe: "./Sprites/Pipes/night_pipe.png",
            topPipe: "./Sprites/Pipes/night_pipe.png"
        };
        super(game, 2, assets);
        
        let bird = this.getBird();
        if (bird) {
            bird.invincible = false;
            bird.invincibleTimer = 0;
            if (bird.powerSoundLoop) {
                bird.powerSoundLoop.pause();
                bird.powerSoundLoop = null;
            }
            
            bird.sprite = ASSET_MANAGER.getAsset("./Sprites/Bird/bluebird_sprite_sheet.png");
            
            if (typeof bird.enableAutoShooting === 'function') {
                bird.enableAutoShooting();
                
                this.powerUpNotification = {
                    active: true,
                    timer: 0,
                    duration: 3,
                    text: "AUTO-TARGETING ACTIVATED!"
                };
            }
        }

        
        const coinType = game.selectedCoinType || 'default';
        let coinCount = coinType === 'custom' ? 2 : 15;
        this.coinProgress = new CoinProgress(game, 800, coinCount);
        
        this.weaponUpgradeAnimation = {
            active: true,
            timer: 0,
            duration: 2
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
        
        if (this.powerUpNotification && this.powerUpNotification.active) {
            this.powerUpNotification.timer += this.game.clockTick;
            if (this.powerUpNotification.timer >= this.powerUpNotification.duration) {
                this.powerUpNotification.active = false;
            }
        }
        
        if (this.weaponUpgradeAnimation && this.weaponUpgradeAnimation.active) {
            this.weaponUpgradeAnimation.timer += this.game.clockTick;
            if (this.weaponUpgradeAnimation.timer >= this.weaponUpgradeAnimation.duration) {
                this.weaponUpgradeAnimation.active = false;
            }
        }
    }
    
    draw(ctx) {
        super.draw(ctx);
        
        if (this.powerUpNotification && this.powerUpNotification.active) {
            const alpha = Math.min(1, this.powerUpNotification.timer * 2);
            let fadeAlpha = 1;
            
            if (this.powerUpNotification.timer > this.powerUpNotification.duration - 0.5) {
                fadeAlpha = (this.powerUpNotification.duration - this.powerUpNotification.timer) * 2;
            }
            
            ctx.save();
            ctx.globalAlpha = fadeAlpha;
            
            const boxWidth = 400;
            const boxHeight = 60;
            const boxX = (ctx.canvas.width - boxWidth) / 2;
            const boxY = 200;
            
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
        
        if (this.weaponUpgradeAnimation && this.weaponUpgradeAnimation.active) {
            const bird = this.getBird();
            if (bird) {
                const centerX = bird.x + 34 * 0.6;
                const centerY = bird.y + 70 * 0.6;
                const progress = this.weaponUpgradeAnimation.timer / this.weaponUpgradeAnimation.duration;
                
                ctx.save();
                
                if (progress < 0.5) {
                    const radius = 80 * (progress * 2);
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(50, 150, 255, ${1 - progress * 2})`;
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
                
                const particleCount = 12;
                for (let i = 0; i < particleCount; i++) {
                    const angle = (i / particleCount) * Math.PI * 2;
                    const distance = 40 + Math.sin(progress * Math.PI + i) * 20;
                    const x = centerX + Math.cos(angle + progress * 10) * distance;
                    const y = centerY + Math.sin(angle + progress * 10) * distance;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(100, 200, 255, ${1 - progress * 0.5})`;
                    ctx.fill();
                    
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.lineTo(x, y);
                    ctx.strokeStyle = `rgba(100, 200, 255, ${0.2 - progress * 0.1})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                
                const ringCount = 2;
                for (let i = 0; i < ringCount; i++) {
                    const radius = 25 + i * 15;
                    ctx.beginPath();
                    ctx.ellipse(
                        centerX, 
                        centerY, 
                        radius, 
                        radius * 0.4, 
                        progress * Math.PI * 2, 
                        0, 
                        Math.PI * 2
                    );
                    ctx.strokeStyle = `rgba(0, 150, 255, ${0.5 - progress * 0.3})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                
                const glowGradient = ctx.createRadialGradient(
                    centerX, centerY, 0,
                    centerX, centerY, 25
                );
                glowGradient.addColorStop(0, `rgba(200, 230, 255, ${0.8 - progress * 0.4})`);
                glowGradient.addColorStop(1, `rgba(0, 100, 255, ${0.0})`);
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
                ctx.fillStyle = glowGradient;
                ctx.fill();
                
                ctx.restore();
            }
        }
    }
}