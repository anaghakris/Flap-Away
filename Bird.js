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
        this.isFlapping = true;

        this.flapSound = ASSET_MANAGER.getAsset("./audio/sfx_wing.wav");
        this.dieSound = ASSET_MANAGER.getAsset("./audio/sfx_die.wav");
        this.hasPlayedDieSound = false;
        this.lastFlapTime = 0;
        this.flapCooldown = 250;

        this.score = 0;

        this.BIRD_WIDTH = 50 * 0.6;
        this.BIRD_HEIGHT = 50 * 0.6;
        this.BIRD_X_OFFSET = 5;
        this.BIRD_Y_OFFSET = 5;

        // NEW: Invincibility properties
        this.invincible = false;
        this.invincibleTimer = 0; // seconds remaining
    }

    reset() {
        this.x = 200;
        this.y = 300;
        this.velocity = 0;
        this.rotation = 0;
        this.gameStarted = false;
        this.isFlapping = true;
        this.hasPlayedDieSound = false;
        this.game.hasCollided = false;
        this.lastFlapTime = 0;
        this.score = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
    }

    startGame() {
        this.gameStarted = true;
    }

    update() {
        if (!this.gameStarted) return;

        // --- NEW: Update invincibility timer ---
        if (this.invincible) {
            this.invincibleTimer -= this.game.clockTick; // assuming clockTick is in seconds
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.invincibleTimer = 0;
            }
        }

        if (this.game.gameOver) {
            this.velocity += this.gravity;
            this.y += this.velocity;
            this.rotation = this.maxRotationDown;
            this.isFlapping = false;

            if (!this.hasPlayedDieSound && !this.game.hasCollided) { 
                if (this.dieSound) {
                    this.dieSound.currentTime = 0;
                    this.dieSound.play();
                    this.hasPlayedDieSound = true;
                }
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

        if (this.isFlapping) {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2 * scale);
        } else {
            ctx.drawImage(
                this.animator.spritesheet,
                0, 0, 34, 70, 
                this.x, this.y, 
                34 * 2 * scale, 70 * 2 * scale
            );
        }
        ctx.restore();

        // OPTIONAL: Visual cue for invincibility (yellow outline)
        if (this.invincible) {
            ctx.beginPath();
            ctx.arc(this.x + 34 * scale / 2, this.y + 70 * scale / 2, 40, 0, Math.PI * 2);
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.strokeText(this.score.toString(), 400, 50);
        ctx.fillText(this.score.toString(), 400, 50);
    }
}
