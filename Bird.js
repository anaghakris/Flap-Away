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
        this.powerUpSound = ASSET_MANAGER.getAsset("./audio/powerup.wav");
        this.powerSoundLoop = null;
        this.hasPlayedDieSound = false;
        this.lastFlapTime = 0;
        this.flapCooldown = 250;
        this.score = 0;
        this.BIRD_WIDTH = 50 * 0.6;
        this.BIRD_HEIGHT = 50 * 0.6;
        this.BIRD_X_OFFSET = 5;
        this.BIRD_Y_OFFSET = 5;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.invincibleEffects = {
            glowRadius: 40,
            glowOpacity: 0.6,
            sparkleTimer: 0,
            sparkles: [],
            trailPoints: [],
            maxTrailPoints: 10,
            rainbowHue: 0
        };
        this.powerUpAnimation = {
            active: false,
            duration: 2,
            timer: 0,
            scale: 0,
            opacity: 0,
            flashTimer: 0,
            flashDuration: 0.1,
            showFlash: false,
            textY: -50
        };
        this.projectiles = [];
    }

    shoot(targetX, targetY) {
        const centerX = this.x + 34 * 0.6;
        const centerY = this.y + 70 * 0.6;
        const dx = targetX - centerX;
        const dy = targetY - centerY;
        const angle = Math.atan2(dy, dx);
        const speed = 10;
        const projectile = {
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 5,
            life: 2
        };
        this.projectiles.push(projectile);
    }

    handleClick(x, y) {
        const background = this.game.entities.find(e => e instanceof BaseBackground);
        if (background && background.level === 2) {
            this.shoot(x, y);
        }
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
        this.powerUpAnimation.active = false;
        this.projectiles = [];
        if (this.powerSoundLoop) {
            this.powerSoundLoop.pause();
            this.powerSoundLoop = null;
        }
    }

    startGame() {
        this.gameStarted = true;
    }

    activatePowerUp() {
        this.invincible = true;
        this.invincibleTimer = 10;
        this.powerUpAnimation.active = true;
        this.powerUpAnimation.timer = 0;
        if (this.powerSoundLoop) {
            this.powerSoundLoop.pause();
            this.powerSoundLoop = null;
        }
        if (this.powerUpSound) {
            this.powerSoundLoop = this.powerUpSound.cloneNode();
            this.powerSoundLoop.volume = 0.3;
            this.powerSoundLoop.loop = true;
            this.powerSoundLoop.play().catch(e => console.log("Audio play failed:", e));
        }
    }

    update() {
        if (!this.gameStarted) return;

        if (this.invincible) {
            if (!this.game.gameOver) {
                this.invincibleTimer -= this.game.clockTick;
                if (this.invincibleTimer <= 0) {
                    this.invincible = false;
                    this.invincibleTimer = 0;
                    this.powerUpAnimation.active = false;
                    if (this.powerSoundLoop) {
                        this.powerSoundLoop.pause();
                        this.powerSoundLoop = null;
                    }
                }
            }
        }

        if (this.powerUpAnimation.active) {
            if (!this.game.gameOver) {
                this.powerUpAnimation.timer += this.game.clockTick;
                if (this.powerUpAnimation.timer <= 0.5) {
                    this.powerUpAnimation.scale = this.powerUpAnimation.timer * 2;
                    this.powerUpAnimation.opacity = this.powerUpAnimation.timer * 2;
                } else if (this.powerUpAnimation.timer <= 1.5) {
                    this.powerUpAnimation.scale = 1;
                    this.powerUpAnimation.opacity = 1;
                } else if (this.powerUpAnimation.timer <= 2) {
                    const fadeProgress = (this.powerUpAnimation.timer - 1.5) * 2;
                    this.powerUpAnimation.opacity = 1 - fadeProgress;
                } else {
                    this.powerUpAnimation.active = false;
                }
                this.powerUpAnimation.flashTimer += this.game.clockTick;
                if (this.powerUpAnimation.flashTimer >= this.powerUpAnimation.flashDuration) {
                    this.powerUpAnimation.showFlash = !this.powerUpAnimation.showFlash;
                    this.powerUpAnimation.flashTimer = 0;
                }
            }
        }

        if (this.game.gameOver) {
            if (this.powerSoundLoop) {
                this.powerSoundLoop.pause();
                this.powerSoundLoop = null;
            }
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
            this.updateProjectiles();
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

        this.updateProjectiles();
    }

    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.x += proj.vx;
            proj.y += proj.vy;
            proj.life -= this.game.clockTick;
            if (proj.life <= 0) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        if (this.invincible) {
            this.drawPowerBoostEffects(ctx);
        }
        ctx.save();
        ctx.translate(this.x + 34 / 2, this.y + 70 / 2);
        ctx.rotate(this.rotation);
        ctx.translate(-(this.x + 34 / 2), -(this.y + 70 / 2));
        const scale = 0.53;
        const centerX = this.x + (34 * scale);
        const centerY = this.y + (35 * scale);
        const radius = 10;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(147, 0, 255, 0.3)';
        ctx.stroke();
        if (this.isFlapping) {
            if (this.invincible) {
                ctx.shadowColor = `hsla(${this.invincibleEffects.rainbowHue}, 100%, 50%, 0.8)`;
                ctx.shadowBlur = 15;
            }
            this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2 * scale);
        } else {
            if (this.invincible) {
                ctx.shadowColor = `hsla(${this.invincibleEffects.rainbowHue}, 100%, 50%, 0.8)`;
                ctx.shadowBlur = 15;
            }
            ctx.drawImage(
                this.animator.spritesheet,
                0, 0, 34, 70,
                this.x, this.y,
                34 * 2 * scale, 70 * 2 * scale
            );
        }
        ctx.restore();
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.strokeText(this.score.toString(), 400, 50);
        ctx.fillText(this.score.toString(), 400, 50);
        if (this.invincible) {
            ctx.font = "20px Arial";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.strokeText(`Power: ${Math.ceil(this.invincibleTimer)}s`, 400, 80);
            ctx.fillText(`Power: ${Math.ceil(this.invincibleTimer)}s`, 400, 80);
        }
        // Draw projectiles
        for (let proj of this.projectiles) {
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'yellow';
            ctx.fill();
        }
    }

    drawPowerBoostEffects(ctx) {
        const birdCenterX = this.x + 34 * 0.6;
        const birdCenterY = this.y + 70 * 0.6;
        this.invincibleEffects.rainbowHue = (this.invincibleEffects.rainbowHue + 2) % 360;
        const gradient = ctx.createRadialGradient(
            birdCenterX, birdCenterY, 10,
            birdCenterX, birdCenterY, this.invincibleEffects.glowRadius
        );
        gradient.addColorStop(0, `hsla(${this.invincibleEffects.rainbowHue}, 100%, 50%, ${this.invincibleEffects.glowOpacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath();
        ctx.arc(birdCenterX, birdCenterY, this.invincibleEffects.glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        this.invincibleEffects.trailPoints.unshift({ x: birdCenterX, y: birdCenterY });
        if (this.invincibleEffects.trailPoints.length > this.invincibleEffects.maxTrailPoints) {
            this.invincibleEffects.trailPoints.pop();
        }
        ctx.beginPath();
        ctx.moveTo(this.invincibleEffects.trailPoints[0].x, this.invincibleEffects.trailPoints[0].y);
        for (let i = 1; i < this.invincibleEffects.trailPoints.length; i++) {
            const point = this.invincibleEffects.trailPoints[i];
            ctx.lineTo(point.x, point.y);
        }
        ctx.strokeStyle = `hsla(${(this.invincibleEffects.rainbowHue + 180) % 360}, 100%, 50%, 0.5)`;
        ctx.lineWidth = 3;
        ctx.stroke();
        this.invincibleEffects.sparkleTimer += this.game.clockTick;
        if (this.invincibleEffects.sparkleTimer > 0.1) {
            this.invincibleEffects.sparkleTimer = 0;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 30;
            this.invincibleEffects.sparkles.push({
                x: birdCenterX + Math.cos(angle) * distance,
                y: birdCenterY + Math.sin(angle) * distance,
                size: 2 + Math.random() * 3,
                life: 1
            });
        }
        this.invincibleEffects.sparkles = this.invincibleEffects.sparkles.filter(sparkle => {
            sparkle.life -= this.game.clockTick * 2;
            if (sparkle.life <= 0) return false;
            ctx.beginPath();
            ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.invincibleEffects.rainbowHue}, 100%, 50%, ${sparkle.life})`;
            ctx.fill();
            return true;
        });
    }

    changeSpriteSheet(newSpriteSheet) {
        this.animator = new Animator(
            newSpriteSheet,
            0, 0, 34, 70, 3, 0.2
        );
    }
}