class CoinSelectionButtons {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.setupButtons();
    }

    setupButtons() {
        const buttonsContainer = document.getElementById('coin-selection-buttons');
        if (!buttonsContainer) {
            console.error('Coin selection buttons container not found');
            return;
        }
        buttonsContainer.style.position = 'fixed';
        buttonsContainer.style.top = '20px';
        buttonsContainer.style.left = '50%';
        buttonsContainer.style.transform = 'translateX(-50%)';
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '16px';
        buttonsContainer.style.zIndex = '1000';

        const defaultCoinsButton = this.createButton('Default Coins', '#4CAF50', () => {
            this.switchCoinType('default');
        });
        const customCoinsButton = this.createButton('Custom Coins', '#FF5722', () => {
            this.switchCoinType('custom');
        });
        
        buttonsContainer.appendChild(defaultCoinsButton);
        buttonsContainer.appendChild(customCoinsButton);
    }

    createButton(text, backgroundColor, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.backgroundColor = backgroundColor;
        button.style.color = 'white';
        button.style.padding = '4px 8px';
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
        
        // Prevent the button from stealing focus on mousedown.
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
    
        button.addEventListener('click', (e) => {
            onClick();
            // Optionally, remove focus from the button after click.
            button.blur();
        });
    
        return button;
    }
    

    switchCoinType(type) {
        this.gameEngine.selectedCoinType = type;
        const background = this.gameEngine.entities.find(entity => entity.level !== undefined);
        if (!background) {
            console.error('Background entity not found');
            return;
        }
        let coinCount;
        if (type === 'custom') {
            coinCount = 2; 
        } else {
            switch (background.level) {
                case 1:
                    coinCount = 8; 
                    break;
                case 2:
                    coinCount = 15; 
                    break;
                case 3:
                    coinCount = 20; 
                    break;
                default:
                    coinCount = 8; 
                    break;
            }
        }
    
        background.coinProgress = new CoinProgress(this.gameEngine, 800, coinCount);
        background.coins = [];
        background.coinProgress.reset();
        console.log(`Switched to ${type} coin type with ${coinCount} coins.`);
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
