class CoinProgress {
    constructor(game, width = 800, maxCoins = 2) {
        this.game = game;
        this.width = width;
        this.maxCoins = maxCoins;
        this.coinsCollected = 0;

        this.isInvincible = false;
        this.invincibilityStartTime = 0;
        this.invincibilityDuration = 1500; 
        this.titleScale = 1; 
        this.titleOpacity = 0; 

        this.colors = {
            background: '#4EC0CA',
            border: '#2F8C95',
            fill: {
                start: '#66CC00',
                middle: '#33AA00',
                end: '#008800'
            },
            text: '#FFFFFF',
            title: {
                main: '#33AA00',
                shadow: '#008800',
                outline: '#FFFFFF'
            },
            invincibilityTitle: {
                main: '#FF0000', 
                shadow: '#880000', 
                outline: '#FFFFFF' 
            }
        };
    }

    collectCoin() {
        if (this.coinsCollected < this.maxCoins) {
            this.coinsCollected++;

            if (this.coinsCollected >= this.maxCoins) {
                const bird = this.game.entities.find(entity => entity instanceof Bird);
                if (bird) {
                    // Always activate invincibility regardless of level
                    bird.activatePowerUp();
                    this.activateInvincibility();
                    
                    // If we're in level 3, also activate the shockwave powerup
                    const background = this.game.entities.find(entity => entity instanceof BaseBackground);
                    if (background && background.level === 3 && typeof background.activateShockwavePowerup === 'function') {
                        background.activateShockwavePowerup();
                    }
                }
                this.reset();
            }
        }
    }

    activateInvincibility() {
        // Check if we're in level 3 - if so, don't show the invincibility notification
        const background = this.game.entities.find(entity => entity instanceof BaseBackground);
        const isLevel3 = background && background.level === 3;
        
        // Only set up the notification if not in level 3
        this.isInvincible = true;
        this.invincibilityStartTime = Date.now();
        
        // In level 3, we don't need to show the invincibility notification
        // as it's combined with the shockwave notification
        if (isLevel3) {
            this.titleScale = 0;
            this.titleOpacity = 0;
        }
    }

    reset() {
        this.coinsCollected = 0;
    }

    createGradient(ctx, barX, barY, barWidth, barHeight) {
        const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
        gradient.addColorStop(0, this.colors.fill.start);
        gradient.addColorStop(0.5, this.colors.fill.middle);
        gradient.addColorStop(1, this.colors.fill.end);
        return gradient;
    }

    draw(ctx) {
        const barWidth = 160;
        const barHeight = 30;
        const barX = 20;
        const barY = 35;
        const cornerRadius = 15;

        const titleX = barX + barWidth / 2;
        const titleY = 20;
        const titleText = 'COIN TRACKER';

        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = this.colors.title.shadow;
        ctx.fillText(titleText, titleX + 2, titleY + 2);

        ctx.fillStyle = this.colors.title.main;
        ctx.fillText(titleText, titleX, titleY);

        ctx.lineWidth = 1;
        ctx.strokeStyle = this.colors.title.outline;
        ctx.strokeText(titleText, titleX, titleY);

        if (this.isInvincible) {
            const currentTime = Date.now();
            const elapsedTime = currentTime - this.invincibilityStartTime;

            // Check if we're in level 3
            const background = this.game.entities.find(entity => entity instanceof BaseBackground);
            const isLevel3 = background && background.level === 3;
            
            // Only proceed with invincibility animation if not in level 3
            if (!isLevel3) {
                if (elapsedTime < 500) {
                    this.titleScale = 1 + (elapsedTime / 500) * 0.2; 
                    this.titleOpacity = Math.min(1, elapsedTime / 500); 
                } else if (elapsedTime < this.invincibilityDuration - 500) {
                    this.titleScale = 1.2;
                    this.titleOpacity = 1;
                } else if (elapsedTime < this.invincibilityDuration) {
                    const fadeOutProgress = (elapsedTime - (this.invincibilityDuration - 500)) / 500;
                    this.titleScale = 1.2 - fadeOutProgress * 1.5; 
                    this.titleOpacity = 1 - fadeOutProgress;
                } else {
                    this.isInvincible = false;
                    this.titleScale = 1;
                    this.titleOpacity = 0;
                }

                const invincibilityTitleX = this.width / 2; 
                const invincibilityTitleY = this.width / 2; 
                const invincibilityTitleText = 'INVINCIBILITY ENABLED';

                ctx.save();

                ctx.translate(invincibilityTitleX, invincibilityTitleY);
                ctx.scale(this.titleScale, this.titleScale);
                ctx.globalAlpha = this.titleOpacity;

                ctx.font = 'bold 40px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                ctx.fillStyle = this.colors.invincibilityTitle.shadow;
                ctx.fillText(invincibilityTitleText, 2, 2);

                ctx.fillStyle = this.colors.invincibilityTitle.main;
                ctx.fillText(invincibilityTitleText, 0, 0);

                ctx.lineWidth = 2;
                ctx.strokeStyle = this.colors.invincibilityTitle.outline;
                ctx.strokeText(invincibilityTitleText, 0, 0);

                ctx.restore();
            } else if (elapsedTime >= this.invincibilityDuration) {
                // Still need to update the invincibility state
                this.isInvincible = false;
            }
        }

        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.beginPath();
        ctx.moveTo(barX + cornerRadius, barY);
        ctx.lineTo(barX + barWidth - cornerRadius, barY);
        ctx.quadraticCurveTo(barX + barWidth, barY, barX + barWidth, barY + cornerRadius);
        ctx.lineTo(barX + barWidth, barY + barHeight - cornerRadius);
        ctx.quadraticCurveTo(barX + barWidth, barY + barHeight, barX + barWidth - cornerRadius, barY + barHeight);
        ctx.lineTo(barX + cornerRadius, barY + barHeight);
        ctx.quadraticCurveTo(barX, barY + barHeight, barX, barY + barHeight - cornerRadius);
        ctx.lineTo(barX, barY + cornerRadius);
        ctx.quadraticCurveTo(barX, barY, barX + cornerRadius, barY);
        ctx.closePath();

        ctx.fillStyle = this.colors.background;
        ctx.fill();

        ctx.shadowColor = 'transparent';

        if (this.coinsCollected > 0) {
            const progress = this.coinsCollected / this.maxCoins;
            const fillWidth = (barWidth - 4) * progress;

            ctx.beginPath();
            ctx.moveTo(barX + cornerRadius, barY + 2);
            ctx.lineTo(barX + Math.min(fillWidth, barWidth - cornerRadius), barY + 2);

            if (fillWidth > barWidth - cornerRadius) {
                ctx.quadraticCurveTo(barX + fillWidth, barY + 2,
                    barX + fillWidth, barY + cornerRadius);
                ctx.lineTo(barX + fillWidth, barY + barHeight - cornerRadius);
                ctx.quadraticCurveTo(barX + fillWidth, barY + barHeight - 2,
                    barX + fillWidth - cornerRadius, barY + barHeight - 2);
            }

            ctx.lineTo(barX + cornerRadius, barY + barHeight - 2);
            ctx.quadraticCurveTo(barX + 2, barY + barHeight - 2,
                barX + 2, barY + barHeight - cornerRadius);
            ctx.lineTo(barX + 2, barY + cornerRadius);
            ctx.quadraticCurveTo(barX + 2, barY + 2,
                barX + cornerRadius, barY + 2);

            ctx.fillStyle = this.createGradient(ctx, barX, barY, barWidth, barHeight);
            ctx.fill();
        }

        ctx.lineWidth = 2;
        ctx.strokeStyle = this.colors.border;
        ctx.stroke();

        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = this.colors.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            `${this.coinsCollected}/${this.maxCoins}`,
            barX + barWidth / 2,
            barY + barHeight / 2
        );
    }
}