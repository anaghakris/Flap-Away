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
        this.lift = -4.8;
        this.rotation = 0;
        this.maxRotationDown = Math.PI / 2;
        this.maxRotationUp = -Math.PI / 8;
        this.gameStarted = false;
        this.smoothingFactor = 0.15;

        this.flapSound = ASSET_MANAGER.getAsset("./audio/sfx_wing.wav");
        this.dieSound = ASSET_MANAGER.getAsset("./audio/sfx_die.wav");
        this.hasPlayedDieSound = false;
        this.lastFlapTime = 0;        
        this.flapCooldown = 250;  
    }

    startGame() {
        this.gameStarted = true;
    }

    update() {
        if (!this.gameStarted) return;

        if (this.game.gameOver) {
            this.velocity += this.gravity;
            this.y += this.velocity;
            this.rotation = this.maxRotationDown;

            if (!this.hasPlayedDieSound && this.dieSound) {
                this.dieSound.currentTime = 0;
                this.dieSound.play();
                this.hasPlayedDieSound = true; // Mark the sound as played
            }
            
            if (this.y > 565 - 70) {
                this.y = 565 - 70;
                this.velocity = 0;
            }
            return;
        }

        this.velocity += this.gravity;
        this.velocity *= 0.95;
        this.y += this.velocity;

        if (this.game.keys[" "]) {
            this.velocity = this.lift;

            const currentTime = Date.now();
            if (currentTime - this.lastFlapTime >= this.flapCooldown) {
                if (this.flapSound) {
                    this.flapSound.pause();
                    this.flapSound.currentTime = 0;
                    
                    const flapSoundClone = this.flapSound.cloneNode();
                    flapSoundClone.volume = 0.5;  
                    flapSoundClone.play().catch(e => console.log("Audio play failed:", e));
                }
                
                this.lastFlapTime = currentTime;
            }
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
            this.game.gameOver = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + 34 / 2, this.y + 70 / 2);
        ctx.rotate(this.rotation);
        ctx.translate(-(this.x + 34 / 2), -(this.y + 70 / 2));
        const scale = 0.6;
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2 * scale);

        if (this.game.options.debugging) {
            const scaledWidth = 34 * 1.2;
            const scaledHeight = 70 * 1.2;
            const birdRadius = scaledWidth * 0.2;
            ctx.beginPath();
            ctx.arc(
                this.x + scaledWidth / 2,
                this.y + scaledHeight / 2,
                birdRadius,
                0,
                2 * Math.PI
            );
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();
    }
}