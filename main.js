const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./Sprites/Background/Daytime.png");
ASSET_MANAGER.queueDownload("./Sprites/Background/base.png");
ASSET_MANAGER.queueDownload("./Sprites/Pipes/bottom pipe.png");
ASSET_MANAGER.queueDownload("./Sprites/Pipes/top pipe.png");
ASSET_MANAGER.queueDownload("./Sprites/Bird/yellowbird-sprite-sheet.png")
ASSET_MANAGER.queueDownload("./Sprites/Bird/bluebird_sprite_sheet.png")
ASSET_MANAGER.queueDownload("./Sprites/Bird/redbird_sprite_sheet.png")
ASSET_MANAGER.queueDownload("./Sprites/Bird/evil_bird.png");
ASSET_MANAGER.queueDownload("./Sprites/Pipes/SnappingPlant.png"); 
ASSET_MANAGER.queueDownload("./Sprites/Pipes/snapping plants top.png");
ASSET_MANAGER.queueDownload("./Sprites/Background/coin.png");
ASSET_MANAGER.queueDownload("./audio/sfx_wing.wav");
ASSET_MANAGER.queueDownload("./audio/sfx_point.wav");
ASSET_MANAGER.queueDownload("./audio/sfx_die.wav");
ASSET_MANAGER.queueDownload("./audio/sfx_hit.wav");
ASSET_MANAGER.queueDownload("./audio/sfx_swooshing.wav");
ASSET_MANAGER.queueDownload("./audio/coin.wav");
ASSET_MANAGER.queueDownload("./audio/piranhaPlant.wav");
ASSET_MANAGER.queueDownload("./audio/powerup.wav");
ASSET_MANAGER.queueDownload("./Sprites/Background/NightCity.png");
ASSET_MANAGER.queueDownload("./Sprites/Background/base_night.png");
ASSET_MANAGER.queueDownload("./Sprites/Pipes/night_pipe.png");
ASSET_MANAGER.queueDownload("./Sprites/mushrooms/mushroom.png");
ASSET_MANAGER.queueDownload("./Sprites/Background/Retro.png");
ASSET_MANAGER.queueDownload("./Sprites/Pipes/level3pipe.png");
ASSET_MANAGER.queueDownload("./Sprites/Pipes/level3pipe.png");
ASSET_MANAGER.queueDownload("./Sprites/Background/redbase.png");





ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    
    const startPage = new StartPage(gameEngine);
    gameEngine.addEntity(startPage);

    gameEngine.init(ctx);
    gameEngine.isTransitioning = false;
    gameEngine.lastTransitionTime = 0; 
    gameEngine.currentState = 'menu'; 
    
    window.gameEngine = gameEngine; 
    const coinButtons = new CoinSelectionButtons(gameEngine);

    canvas.tabIndex = 1;
    canvas.focus();

    canvas.addEventListener("click", (e) => {
        const currentTime = Date.now();
        
        if (currentTime - gameEngine.lastTransitionTime < 500) {
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        if (gameEngine.gameOver && !gameEngine.isTransitioning) {
            const btnWidth = 120;
            const btnHeight = 40;
            const panelY = (canvas.height - 160) / 2 - 50;
            const btnX = (canvas.width - btnWidth) / 2;
            const btnY = panelY + 160 + 10;

            const menuBtnWidth = 240;
            const menuBtnHeight = 40;
            const menuBtnX = (canvas.width - menuBtnWidth) / 2;
            const menuBtnY = btnY + btnHeight + 10;

            if (clickX >= btnX && clickX <= btnX + btnWidth &&
                clickY >= btnY && clickY <= btnY + btnHeight) {
                
                if (gameEngine.currentState !== 'transitioning') {
                    gameEngine.isTransitioning = true;
                    gameEngine.currentState = 'transitioning';
                    gameEngine.lastTransitionTime = currentTime;
                    gameEngine.gameOver = false;

                    gameEngine.entities.forEach(entity => {
                        if (entity.reset) {
                            entity.reset();
                        }
                    });

                    setTimeout(() => {
                        gameEngine.isTransitioning = false;
                        gameEngine.currentState = 'playing';
                    }, 200);
                }
            } 

            if (clickX >= menuBtnX && clickX <= menuBtnX + menuBtnWidth &&
                clickY >= menuBtnY && clickY <= menuBtnY + menuBtnHeight) {
                
                if (gameEngine.currentState !== 'transitioning') {
                    gameEngine.isTransitioning = true;
                    gameEngine.currentState = 'transitioning';
                    gameEngine.lastTransitionTime = currentTime;
                    gameEngine.gameOver = false;

                    gameEngine.entities.forEach(entity => {
                        if (entity.reset) {
                            entity.reset();
                        }
                    });
                    gameEngine.entities = [];

                    const startPage = new StartPage(gameEngine);
                    gameEngine.addEntity(startPage);

                    setTimeout(() => {
                        gameEngine.isTransitioning = false;
                        gameEngine.currentState = 'menu';
                    }, 200);
                }
            }
        }
    });

    gameEngine.start();
});