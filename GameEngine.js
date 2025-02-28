class GameEngine {
    constructor(options) {
        this.ctx = null;
        this.entities = [];
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {};
        this.options = options || { debugging: false };
        this.currentLevel = 1; 
    }

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
    }

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }

    startInput() {
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });
        
        this.ctx.canvas.addEventListener("click", e => {
            const clickPos = getXandY(e);
            if (this.options.debugging) {
                console.log("CLICK", clickPos);
            }
            this.click = clickPos;
            
            this.entities.forEach(entity => {
                if (entity.constructor.name === "Bird" && entity.autoShooting) {
                    if (this.options.debugging) {
                        console.log("Skipping Bird's handleClick due to auto-shooting");
                    }
                } 
                else if (entity.handleClick) {
                    entity.handleClick(clickPos.x, clickPos.y);
                }
            });
        });
        
        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.options.debugging) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });
        
        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.debugging) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault();
            this.wheel = e;
        });
        
        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.options.debugging) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            e.preventDefault();
            this.rightclick = getXandY(e);
        });
        
        this.ctx.canvas.addEventListener("keydown", event => this.keys[event.key] = true);
        this.ctx.canvas.addEventListener("keyup", event => this.keys[event.key] = false);
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    changeLevel(level) {
        this.currentLevel = level;
        this.entities = [];
    }

    update() {
        const entitiesCount = this.entities.length;
        for (let i = 0; i < entitiesCount; i++) {
            const entity = this.entities[i];
            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        this.entities.forEach(entity => {
            if (entity.projectiles) {
                entity.projectiles.forEach(projectile => {
                    projectile.x += projectile.vx;
                    projectile.y += projectile.vy;
                    projectile.life -= this.clockTick;
                });
                entity.projectiles = entity.projectiles.filter(projectile => projectile.life > 0);
            }
        });

        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i].draw(this.ctx, this);
        }

        this.entities.forEach(entity => {
            if (entity.projectiles) {
                entity.projectiles.forEach(projectile => {
                    this.ctx.beginPath();
                    this.ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
                    this.ctx.fillStyle = 'yellow';
                    this.ctx.fill();
                });
            }
        });

        if (this.options.debugging && this.click) {
            this.ctx.fillStyle = "red";
            this.ctx.beginPath();
            this.ctx.arc(this.click.x, this.click.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    }
}