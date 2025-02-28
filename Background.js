class Background extends BaseBackground {
    constructor(game) {
        const assets = {
            background: "./Sprites/Background/Daytime.png",
            base: "./Sprites/Background/base.png",
            pipe: "./Sprites/Pipes/bottom pipe.png",
            topPipe: "./Sprites/Pipes/bottom pipe.png"
        };
        super(game, 1, assets);
        this.coinProgress = new CoinProgress(game, 800, 8);
        this.levelTitleAnimation = {
            active: false,
            timer: 0,
            duration: 2,
            scale: 0,
            opacity: 0,
            y: 0
        };
        this.powerUpNotification = null;
        this.weaponUpgradeAnimation = null;
    }

    transitionToLevel2() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('flappyBestScore', this.bestScore);
        }
        
        this.level = 2;

        this.levelTitleAnimation = {
            active: true,
            timer: 0,
            duration: 2,
            scale: 0,
            opacity: 0,
            y: this.game.ctx.canvas.height / 2
        };

        this.pipeArray = [];
        this.snappingPlants = [];
        this.coins = [];
        this.enemyBigBirds = [];
        
        this.image = ASSET_MANAGER.getAsset("./Sprites/Background/NightCity.png");
        this.base = ASSET_MANAGER.getAsset("./Sprites/Background/base_night.png");
        this.pipeSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/night_pipe.png");
        this.topPipeSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/night_pipe.png");
        
        this.pipePairCount = 0;
        this.evilWaveTriggered = false;

        const coinType = this.game.selectedCoinType || 'default';
        let coinCount = coinType === 'custom' ? 2 : 15;
        
        this.coinProgress = new CoinProgress(this.game, 800, coinCount);
        
        if (!this.pipeSpawnInterval) {
            this.setupPipeSpawning();
        }
        
        let bird = this.getBird();
        if (bird) {
            bird.changeSpriteSheet(ASSET_MANAGER.getAsset("./Sprites/Bird/bluebird_sprite_sheet.png"));
            
            console.log("Activating auto-shooting in transition to level 2");
            if (typeof bird.enableAutoShooting === 'function') {
                console.log("Auto-shooting function exists, enabling...");
                bird.enableAutoShooting();
                
                this.powerUpNotification = {
                    active: true,
                    timer: 0,
                    duration: 3,
                    text: "AUTO-TARGETING ACTIVATED!"
                };
                
                console.log("Bird auto-shooting enabled:", bird.autoShooting);
            } else {
                console.error("Bird doesn't have enableAutoShooting method!");
                
                console.log("Adding auto-shooting properties directly");
                bird.autoShooting = true;
                bird.shootCooldown = 0;
                bird.shootInterval = 1; 
                
                if (typeof bird.findTargetPlant !== 'function') {
                    bird.findTargetPlant = function() {
                        const background = this.game.entities.find(e => e instanceof BaseBackground);
                        if (!background || !background.snappingPlants || background.snappingPlants.length === 0) {
                            return null;
                        }
                        
                        const plantsAhead = background.snappingPlants.filter(plant => 
                            plant.x > this.x + 20 && !plant.isDead && plant.x < this.x + 500
                        );
                        
                        if (plantsAhead.length === 0) return null;
                        
                        return plantsAhead[0];
                    };
                }
                
                if (!bird.projectiles) {
                    bird.projectiles = [];
                }
                
                const originalShoot = bird.shoot;
                bird.shoot = function(targetX, targetY) {
                    const centerX = this.x + 34 * 0.6;
                    const centerY = this.y + 70 * 0.6;
                    const dx = targetX - centerX;
                    const dy = targetY - centerY;
                    const angle = Math.atan2(dy, dx);
                    const speed = 10;
                    
                    if (this.swooshSound) {
                        const sound = this.swooshSound.cloneNode();
                        sound.volume = 0.3;
                        sound.play().catch(e => console.log("Audio play failed:", e));
                    }
                    
                    const projectile = {
                        x: centerX,
                        y: centerY,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        radius: 5,
                        life: 2,
                        color: 'yellow'
                    };
                    
                    if (!this.projectiles) {
                        this.projectiles = [];
                    }
                    
                    this.projectiles.push(projectile);
                    return projectile;
                };
                
                const originalUpdate = bird.update;
                bird.update = function() {
                    if (originalUpdate) {
                        originalUpdate.call(this);
                    }
                    
                    if (!this.game.gameOver && this.gameStarted && this.autoShooting) {
                        this.shootCooldown -= this.game.clockTick;
                        
                        if (this.shootCooldown <= 0) {
                            const targetPlant = this.findTargetPlant();
                            
                            if (targetPlant) {
                                const background = this.game.entities.find(e => e instanceof BaseBackground);
                                
                                const plantWidth = background.snappingPlantFrameWidth * background.snappingPlantScale;
                                const plantHeight = targetPlant.type === "top" 
                                    ? background.snappingPlantTopFrameHeight * background.snappingPlantScale
                                    : background.snappingPlantFrameHeight * background.snappingPlantScale;
                                    
                                const plantCenterX = targetPlant.x + plantWidth / 2;
                                const plantCenterY = targetPlant.type === "top" 
                                    ? targetPlant.y + plantHeight / 2
                                    : targetPlant.y + plantHeight / 2;
                                
                                this.shoot(plantCenterX, plantCenterY);
                                this.shootCooldown = this.shootInterval;
                            } else {
                                this.shootCooldown = 0.5;
                            }
                        }
                    }
                    
                    if (this.projectiles) {
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
                };
                
                const originalDraw = bird.draw;
                bird.draw = function(ctx) {
                    originalDraw.call(this, ctx);
                    
                    if (this.projectiles) {
                        for (let proj of this.projectiles) {
                            ctx.beginPath();
                            ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
                            ctx.fillStyle = proj.color || 'yellow';
                            ctx.fill();
                        }
                    }
                };
            }
            
            if (bird.startGame) {
                bird.startGame();
            }
        }
        
        if (!this.plantExplosions) {
            this.plantExplosions = [];
        }
        
        this.weaponUpgradeAnimation = {
            active: true,
            timer: 0,
            duration: 2
        };
    }

    checkLevelProgression() {
        if (this.level === 1 && this.coinProgress.coinsCollected >= this.coinProgress.maxCoins) {
            this.transitionToLevel2();
        }
    }

    drawLevelTitle(ctx) {
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
            ctx.strokeText("LEVEL 2", centerX, centerY);
            
            ctx.fillStyle = "#FFD700";
            ctx.fillText("LEVEL 2", centerX, centerY);
            
            ctx.shadowColor = "#FFD700";
            ctx.shadowBlur = 20;
            ctx.fillText("LEVEL 2", centerX, centerY);
            
            ctx.restore();
        }
    }

    draw(ctx) {
        super.draw(ctx);
        this.drawLevelTitle(ctx);
        
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
            if (ctx.roundRect) {
                ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
            } else {
                ctx.moveTo(boxX + 10, boxY);
                ctx.lineTo(boxX + boxWidth - 10, boxY);
                ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + 10);
                ctx.lineTo(boxX + boxWidth, boxY + boxHeight - 10);
                ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - 10, boxY + boxHeight);
                ctx.lineTo(boxX + 10, boxY + boxHeight);
                ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - 10);
                ctx.lineTo(boxX, boxY + 10);
                ctx.quadraticCurveTo(boxX, boxY, boxX + 10, boxY);
                ctx.closePath();
            }
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
                    if (ctx.ellipse) {
                        ctx.ellipse(
                            centerX, 
                            centerY, 
                            radius, 
                            radius * 0.4, 
                            progress * Math.PI * 2, 
                            0, 
                            Math.PI * 2
                        );
                    } else {
                        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    }
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

    update() {
        super.update();
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('flappyBestScore', this.bestScore);
        }
        
        this.checkLevelProgression();
        
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
        
        if (this.level === 2 && this.gameStarted && !this.game.gameOver) {
            const bird = this.getBird();
            if (bird && !bird.autoShooting && typeof bird.enableAutoShooting === 'function') {
                console.log("Enabling auto-shooting in Level 2");
                bird.enableAutoShooting();
            }
        }
    }
}