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
        
        this.coinProgress = new CoinProgress(this.game, 800, 15);
        
        if (!this.pipeSpawnInterval) {
            this.setupPipeSpawning();
        }
        
        let bird = this.getBird();
        if (bird) {
            bird.changeSpriteSheet(ASSET_MANAGER.getAsset("./Sprites/Bird/bluebird_sprite_sheet.png"));
            if (bird.startGame) {
                bird.startGame();
            }
        }
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
    }

    update() {
        super.update();
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('flappyBestScore', this.bestScore);
        }
    }
}