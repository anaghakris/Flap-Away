const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./Sprites/Background/Daytime.png");
ASSET_MANAGER.queueDownload("./Sprites/Background/base.png");
ASSET_MANAGER.queueDownload("./Sprites/Pipes/bottom pipe.png");
ASSET_MANAGER.queueDownload("./Sprites/Pipes/top pipe.png");
ASSET_MANAGER.queueDownload("./Sprites/Bird/yellowbird-sprite-sheet.png")
ASSET_MANAGER.queueDownload("./Sprites/Pipes/SnappingPlant.png"); 
ASSET_MANAGER.queueDownload("./Sprites/Pipes/snapping plants top.png");
ASSET_MANAGER.queueDownload("./Sprites/Background/coin.png");
ASSET_MANAGER.queueDownload("./audio/sfx_wing.wav");
ASSET_MANAGER.queueDownload("./audio/sfx_point.wav");
ASSET_MANAGER.queueDownload("./audio/sfx_die.wav");
ASSET_MANAGER.queueDownload("./audio/sfx_hit.wav");

ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    
    const startPage = new StartPage(gameEngine);
    gameEngine.addEntity(startPage);

    gameEngine.init(ctx);

    canvas.tabIndex = 1;
    canvas.focus();

    canvas.addEventListener("click", (e) => {
        if (gameEngine.gameOver) {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            const btnWidth = 120;
            const btnHeight = 40;
            const panelY = (canvas.height - 160) / 2 - 50;
            const btnX = (canvas.width - btnWidth) / 2;
            const btnY = panelY + 160 + 10;

            if (clickX >= btnX && clickX <= btnX + btnWidth &&
                clickY >= btnY && clickY <= btnY + btnHeight) {
                
                gameEngine.gameOver = false;  
                gameEngine.entities.forEach(entity => {
                    if (entity.reset) {
                        entity.reset();  
                    }
                });
            } 
        }
    });

    gameEngine.start();
});