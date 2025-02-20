class DebugButtons {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.setupButtons();
    }

    setupButtons() {
        const buttonsContainer = document.getElementById('debug-buttons');
        if (!buttonsContainer) {
            console.error('Debug buttons container not found');
            return;
        }

        buttonsContainer.style.position = 'fixed';
        buttonsContainer.style.bottom = '20px';
        buttonsContainer.style.left = '50%';
        buttonsContainer.style.transform = 'translateX(-50%)';
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '16px';
        buttonsContainer.style.zIndex = '1000';

        const level1Button = this.createButton('Level 1', '#3B82F6', () => {
            this.switchToLevel(1);
        });

        const level2Button = this.createButton('Level 2', '#8B5CF6', () => {
            this.switchToLevel(2);
        });

        buttonsContainer.appendChild(level1Button);
        buttonsContainer.appendChild(level2Button);
    }

    createButton(text, backgroundColor, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.backgroundColor = backgroundColor;
        button.style.color = 'white';
        button.style.padding = '8px 16px';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.fontFamily = '"Press Start 2P", monospace';
        button.style.fontSize = '14px';
        button.style.transition = 'background-color 0.2s';

        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = this.adjustColor(backgroundColor, -20);
        });
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = backgroundColor;
        });

        button.addEventListener('click', onClick);
        return button;
    }

    switchToLevel(level) {
        const background = this.gameEngine.entities.find(entity => entity.level !== undefined);
        if (!background) {
            console.error('Background entity not found');
            return;
        }
    
        background.reset();  
        background.level = level;
    
        if (level === 2) {
            background.image = ASSET_MANAGER.getAsset("./Sprites/Background/NightCity.png");
            background.base = ASSET_MANAGER.getAsset("./Sprites/Background/base_night.png");
            background.pipeSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/night_pipe.png");
            background.topPipeSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/night_pipe.png");
    
            background.pipeArray = [];
            background.snappingPlants = [];
            background.coins = [];
            background.enemyBigBirds = [];
    
            background.pipePairCount = 0;
            background.evilWaveTriggered = false;
            background.coinProgress = new CoinProgress(this.gameEngine, 800, 15);
    
            if (!background.pipeSpawnInterval) {
                background.setupPipeSpawning();
            }
    
            let bird = this.gameEngine.entities.find(entity => entity instanceof Bird);
            if (bird) {
                bird.changeSpriteSheet(ASSET_MANAGER.getAsset("./Sprites/Bird/bluebird_sprite_sheet.png"));
                bird.reset(); 
            }
        } else if (level === 1) {
            background.image = ASSET_MANAGER.getAsset("./Sprites/Background/Daytime.png");
            background.base = ASSET_MANAGER.getAsset("./Sprites/Background/base.png");
            background.pipeSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/bottom pipe.png");
            background.topPipeSprite = ASSET_MANAGER.getAsset("./Sprites/Pipes/bottom pipe.png");
            background.coinProgress = new CoinProgress(this.gameEngine, 800, 8);
        }
    
        this.gameEngine.gameOver = false;
        this.gameEngine.hasCollided = false;
    }
    

    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const num = parseInt(hex, 16);
        const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
        const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
}