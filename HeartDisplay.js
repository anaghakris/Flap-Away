class HeartDisplay {
    constructor(game) {
        this.game = game;
        this.lastTime = Date.now();
        this.heartPhases = [0, 0.33, 0.66];
    }

    drawHeart(ctx, x, y, size, phase) {
        ctx.save();
        
        const currentTime = Date.now();
        const danceSpeed = 1000; 
        const time = (currentTime / danceSpeed) + phase;
        
        const xOffset = Math.sin(time * Math.PI * 2) * 3;
        
        ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        
        ctx.translate(x + size/2 + xOffset, y + size/2);

        ctx.beginPath();
        ctx.moveTo(0, size/4);
        ctx.bezierCurveTo(
            size/2, -size/4,
            size/2, size/2,
            0, size/1.5
        );
        ctx.bezierCurveTo(
            -size/2, size/2,
            -size/2, -size/4,
            0, size/4
        );

        const gradient = ctx.createRadialGradient(0, 0, size/4, 0, 0, size);
        gradient.addColorStop(0, '#ff3333');
        gradient.addColorStop(0.5, 'red');
        gradient.addColorStop(1, '#cc0000');
        
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
            this.drawHeart(ctx, x, baseY - heartSize/2, heartSize, this.heartPhases[i]);
        }
    }
}