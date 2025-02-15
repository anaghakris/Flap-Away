class CoinProgress {
    constructor(game, width = 800, maxCoins = 3) {
        this.game = game;
        this.width = width;
        this.maxCoins = maxCoins;
        this.coinsCollected = 0;

        this.isInvincible = false;
        this.invincibilityStartTime = 0;
        this.invincibilityDuration = 3000; 
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
                    bird.activatePowerUp();
                    this.activateInvincibility(); 
                }
                this.reset();
            }
        }
    }

    activateInvincibility() {
        this.isInvincible = true;
        this.invincibilityStartTime = Date.now();
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