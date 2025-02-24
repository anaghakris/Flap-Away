class HeartDisplay {
    constructor(game) {
        this.game = game;
        this.lastTime = Date.now();
        this.heartPhases = [0, 0.33, 0.66];
        this.coinsCollected = 0;
        this.showingNewHeart = false;
        this.newHeartAnimation = {
            active: false,
            x: 0,
            y: 0,
            alpha: 0,
            size: 0
        };
    }

    collectCoin() {
        this.coinsCollected++;
        if (this.coinsCollected === 5) {
            this.triggerNewHeartAnimation();
            this.coinsCollected = 0;
        }
    }

    triggerNewHeartAnimation() {
        this.newHeartAnimation = {
            active: true,
            alpha: 1,
            size: 40,
            time: 0
        };
    }

    drawHeart(ctx, x, y, size, phase, isNewHeart = false) {
        ctx.save();

        const currentTime = Date.now();
        const danceSpeed = 1000; 
        const time = (currentTime / danceSpeed) + phase;

        const xOffset = Math.sin(time * Math.PI * 2) * 3;

        if (isNewHeart) {
            ctx.shadowColor = 'rgba(255, 215, 0, 0.8)'; w
            ctx.shadowBlur = 20;
        } else {
            ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
            ctx.shadowBlur = 15;
        }

        ctx.translate(x + size / 2 + xOffset, y + size / 2);

        // Draw heart shape
        ctx.beginPath();
        ctx.moveTo(0, size / 4);
        ctx.bezierCurveTo(
            size / 2, -size / 4,
            size / 2, size / 2,
            0, size / 1.5
        );
        ctx.bezierCurveTo(
            -size / 2, size / 2,
            -size / 2, -size / 4,
            0, size / 4
        );

        const gradient = ctx.createRadialGradient(0, 0, size / 4, 0, 0, size);
        if (isNewHeart) {
            gradient.addColorStop(0, '#ffd700');
            gradient.addColorStop(0.5, '#ffa500');
            gradient.addColorStop(1, '#ff8c00');
        } else {
            gradient.addColorStop(0, '#ff3333');
            gradient.addColorStop(0.5, 'red');
            gradient.addColorStop(1, '#cc0000');
        }

        ctx.fillStyle = gradient;
        ctx.fill();

        const shimmerAngle = (time * Math.PI * 2) % (Math.PI * 2);
        const shimmerGradient = ctx.createLinearGradient(
            Math.cos(shimmerAngle) * size,
            Math.sin(shimmerAngle) * size,
            Math.cos(shimmerAngle + Math.PI) * size,
            Math.sin(shimmerAngle + Math.PI) * size
        );

        shimmerGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        shimmerGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0)');
        shimmerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        shimmerGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0)');
        shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = shimmerGradient;
        ctx.fill();

        ctx.restore();
    }

    draw(ctx, health, baseX = 45, baseY = 85) {
        const heartSize = 30;
        const spacing = 50;

        for (let i = 0; i < health; i++) {
            const x = baseX + (spacing * i);
            const isNewestHeart = (i === health - 1) && this.newHeartAnimation.active;
            this.drawHeart(ctx, x, baseY - heartSize / 2, heartSize, this.heartPhases[i], isNewestHeart);
        }

        if (this.newHeartAnimation.active) {
            this.newHeartAnimation.time += this.game.clockTick;
            
            if (this.newHeartAnimation.time >= 2) {
                this.newHeartAnimation.active = false;
            } else {
                ctx.save();
                const lastHeartX = baseX + (spacing * (health - 1));
                const centerX = lastHeartX + heartSize / 2;
                const centerY = baseY;
                
                const glowRadius = heartSize * (1 + Math.sin(this.newHeartAnimation.time * Math.PI) * 0.3);
                const gradient = ctx.createRadialGradient(
                    centerX, centerY, 0,
                    centerX, centerY, glowRadius
                );
                
                gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
                gradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.2)');
                gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
    }
}