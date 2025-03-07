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
        
        this.autoShooting = false;
        this.shootCooldown = 0;
        this.shootInterval = 1; 
        this.shootSound = ASSET_MANAGER.getAsset("./audio/sfx_swooshing.wav");
        this.muzzleFlashes = [];
    }

    enableAutoShooting() {
        this.autoShooting = true;
        console.log("Auto-shooting enabled for bird");
    }

    shoot(targetX, targetY) {
        const centerX = this.x + 34 * 0.6;
        const centerY = this.y + 70 * 0.6;
        const dx = targetX - centerX;
        const dy = targetY - centerY;
        const angle = Math.atan2(dy, dx);
        const speed = 12; 
        
        if (this.shootSound) {
            const shootSoundClone = this.shootSound.cloneNode();
            shootSoundClone.volume = 0.3;
            shootSoundClone.play().catch(e => console.log("Audio play failed:", e));
        }
        
        const projectile = {
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 6,
            life: 2,
            targetId: null, 
            color: 'blue',
            trail: [], 
            angle: angle,
            rotation: 0,
            rotationSpeed: 0.2,
            particles: [],
            hue: Math.random() * 60 + 180, // Random color in blue-cyan range
            pulseTimer: 0,
            pulseSpeed: 0.15
        };
        
        this.projectiles.push(projectile);
        
        this.createMuzzleFlash(centerX, centerY, angle);
        
        return projectile;
    }

    createMuzzleFlash(x, y, angle) {
        const flash = {
            x: x + Math.cos(angle) * 20,
            y: y + Math.sin(angle) * 20,
            radius: 15,
            life: 0.15,
            angle: angle
        };
        
        if (!this.muzzleFlashes) {
            this.muzzleFlashes = [];
        }
        
        this.muzzleFlashes.push(flash);
    }

    findTargetPlant() {
        const background = this.game.entities.find(e => e instanceof BaseBackground);
        if (!background || !background.snappingPlants || background.snappingPlants.length === 0) {
            return null;
        }
        
        const centerX = this.x + 34 * 0.6;
        const centerY = this.y + 70 * 0.6;
        
        const plantsAhead = background.snappingPlants.filter(plant => 
            plant.x > centerX && 
            !plant.isDead && 
            plant.x < centerX + 500 
        );
        
        if (plantsAhead.length === 0) return null;
        
        let closestPlant = plantsAhead[0];
        let closestDist = Number.MAX_VALUE;
        
        plantsAhead.forEach(plant => {
            const plantCenterX = plant.x + (background.snappingPlantFrameWidth * background.snappingPlantScale) / 2;
            const plantCenterY = plant.type === "top" 
                ? plant.y + background.snappingPlantTopFrameHeight * background.snappingPlantScale / 2
                : plant.y + background.snappingPlantFrameHeight * background.snappingPlantScale / 2;
                
            const dist = Math.sqrt(
                Math.pow(plantCenterX - centerX, 2) + 
                Math.pow(plantCenterY - centerY, 2)
            );
            
            if (dist < closestDist) {
                closestDist = dist;
                closestPlant = plant;
            }
        });
        
        return closestPlant;
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
        this.autoShooting = false;
        this.shootCooldown = 0;
        if (this.powerSoundLoop) {
            this.powerSoundLoop.pause();
            this.powerSoundLoop = null;
        }
        
        this.invincibleEffects = {
            glowRadius: 40,
            glowOpacity: 0.6,
            sparkleTimer: 0,
            sparkles: [],
            trailPoints: [],
            maxTrailPoints: 10,
            rainbowHue: 0
        };
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
        if (this.game.gameCompleted) {
            this.velocity = 0;
            this.y += Math.sin(Date.now() / 200) * 0.5;
            this.rotation = 0; // Keep the bird level
            this.isFlapping = true; // Keep the flapping animation
    
            if (this.invincible) {
                this.invincibleEffects.rainbowHue = (this.invincibleEffects.rainbowHue + 2) % 360;
            }
            
            this.updateProjectiles();
            return;
        }
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

        if (!this.game.gameOver && this.autoShooting) {
            this.shootCooldown -= this.game.clockTick;
            
            if (this.shootCooldown <= 0) {
                const targetPlant = this.findTargetPlant();
                
                if (targetPlant) {
                    const background = this.game.entities.find(e => e instanceof BaseBackground);
                    const plantCenterX = targetPlant.x + (background.snappingPlantFrameWidth * background.snappingPlantScale) / 2;
                    const plantCenterY = targetPlant.type === "top" 
                        ? targetPlant.y + background.snappingPlantTopFrameHeight * background.snappingPlantScale / 2
                        : targetPlant.y + background.snappingPlantFrameHeight * background.snappingPlantScale / 2;
                    
                    const projectile = this.shoot(plantCenterX, plantCenterY);
                    projectile.targetId = targetPlant.id; 
                    this.shootCooldown = this.shootInterval;
                }
            }
        }
        
        this.projectiles.forEach(proj => {
            if (!proj.trail) proj.trail = [];
            
            if (this.game.clockTick % 0.05 < 0.01) {
                proj.trail.push({
                    x: proj.x, 
                    y: proj.y, 
                    radius: proj.radius * 0.8, 
                    life: 0.4,
                    hue: proj.hue
                });
                
                // Add particles for sparkle effect
                if (Math.random() > 0.5) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * proj.radius * 1.5;
                    
                    proj.particles.push({
                        x: proj.x + Math.cos(angle) * distance,
                        y: proj.y + Math.sin(angle) * distance,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2,
                        radius: Math.random() * 2 + 1,
                        life: Math.random() * 0.3 + 0.1,
                        hue: proj.hue + Math.random() * 40 - 20
                    });
                }
            }
            
            // Update projectile effects
            proj.rotation += proj.rotationSpeed;
            proj.pulseTimer += this.game.clockTick * proj.pulseSpeed;
            
            // Update particles
            for (let i = proj.particles.length - 1; i >= 0; i--) {
                const particle = proj.particles[i];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life -= this.game.clockTick;
                
                if (particle.life <= 0) {
                    proj.particles.splice(i, 1);
                }
            }
            
            if (proj.trail.length > 10) {
                proj.trail.shift();
            }
        });
        
        if (this.projectiles.length > 0) {
            this.projectiles.forEach(proj => {
                if (proj.trail) {
                    for (let i = proj.trail.length - 1; i >= 0; i--) {
                        proj.trail[i].life -= this.game.clockTick;
                        proj.trail[i].radius *= 0.95;
                        if (proj.trail[i].life <= 0) {
                            proj.trail.splice(i, 1);
                        }
                    }
                }
            });
        }
        
        if (this.muzzleFlashes) {
            for (let i = this.muzzleFlashes.length - 1; i >= 0; i--) {
                this.muzzleFlashes[i].life -= this.game.clockTick;
                if (this.muzzleFlashes[i].life <= 0) {
                    this.muzzleFlashes.splice(i, 1);
                }
            }
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
        
        this.projectiles.forEach(proj => {
            if (proj.trail) {
                proj.trail.forEach(trail => {
                    ctx.beginPath();
                    ctx.arc(trail.x, trail.y, trail.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${trail.hue}, 100%, 70%, ${trail.life})`;
                    ctx.fill();
                });
            }
            
            // Draw particles
            proj.particles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${particle.hue}, 100%, 75%, ${particle.life * 3})`;
                ctx.fill();
            });
        });
        
        for (let proj of this.projectiles) {
            ctx.save();
            ctx.translate(proj.x, proj.y);
            ctx.rotate(proj.angle);
            
            // Draw energy trail
            const gradientTrail = ctx.createLinearGradient(-20, 0, 0, 0);
            gradientTrail.addColorStop(0, `hsla(${proj.hue - 30}, 100%, 50%, 0)`);
            gradientTrail.addColorStop(0.5, `hsla(${proj.hue - 15}, 100%, 60%, 0.4)`);
            gradientTrail.addColorStop(1, `hsla(${proj.hue}, 100%, 70%, 0.7)`);
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-20, proj.radius * 1.5);
            ctx.lineTo(-10, 0);
            ctx.lineTo(-20, -proj.radius * 1.5);
            ctx.closePath();
            
            ctx.fillStyle = gradientTrail;
            ctx.fill();
            
            ctx.restore();
            
            // Draw pulsing core
            const pulseScale = 1 + Math.sin(proj.pulseTimer * Math.PI * 2) * 0.15;
            
            // Draw outer glow
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.radius * 2.5 * pulseScale, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${proj.hue}, 100%, 70%, 0.15)`;
            ctx.fill();
            
            // Draw mid glow
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.radius * 1.8 * pulseScale, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${proj.hue}, 100%, 70%, 0.3)`;
            ctx.fill();
            
            // Draw inner core
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.radius * pulseScale, 0, Math.PI * 2);
            
            const gradient = ctx.createRadialGradient(
                proj.x, proj.y, 0,
                proj.x, proj.y, proj.radius * pulseScale
            );
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(0.4, `hsl(${proj.hue}, 100%, 80%)`);
            gradient.addColorStop(0.7, `hsl(${proj.hue}, 100%, 60%)`);
            gradient.addColorStop(1, `hsl(${proj.hue}, 100%, 40%)`);
            
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Energy circling elements
            ctx.save();
            ctx.translate(proj.x, proj.y);
            ctx.rotate(proj.rotation);
            
            // Draw energy rings
            for (let i = 0; i < 3; i++) {
                const angle = (i * Math.PI * 2 / 3) + proj.rotation * 1.5;
                const distX = Math.cos(angle) * proj.radius * 1.3;
                const distY = Math.sin(angle) * proj.radius * 1.3;
                
                ctx.beginPath();
                ctx.arc(distX, distY, proj.radius * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${proj.hue + 30}, 100%, 85%, 0.8)`;
                ctx.fill();
            }
            
            ctx.restore();
        }
        
        if (this.muzzleFlashes) {
            this.muzzleFlashes.forEach(flash => {
                ctx.save();
                ctx.translate(flash.x, flash.y);
                ctx.rotate(flash.angle);
                
                const gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, flash.radius);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                gradient.addColorStop(0.2, 'rgba(255, 255, 0, 0.8)');
                gradient.addColorStop(0.5, 'rgba(255, 150, 0, 0.6)');
                gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
                
                ctx.beginPath();
                ctx.arc(0, 0, flash.radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const innerRadius = flash.radius * 0.5;
                    const outerRadius = flash.radius * 1.5;
                    
                    ctx.lineTo(
                        Math.cos(angle) * outerRadius,
                        Math.sin(angle) * outerRadius
                    );
                    
                    const halfAngle = angle + Math.PI / 8;
                    ctx.lineTo(
                        Math.cos(halfAngle) * innerRadius,
                        Math.sin(halfAngle) * innerRadius
                    );
                }
                ctx.closePath();
                ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
                ctx.fill();
                
                ctx.restore();
            });
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