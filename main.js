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
    
    const bird = new Bird(gameEngine);
    gameEngine.addEntity(bird);

    const background = new Background(gameEngine);
    gameEngine.addEntity(background);

    


    gameEngine.init(ctx);

    canvas.tabIndex = 1;
    canvas.focus();


    canvas.addEventListener("keydown", (e) => {
        if (e.key === " " && gameEngine.gameOver) {
            gameEngine.gameOver = false;
            gameEngine.entities.forEach(entity => {
                if (entity.reset) {
                    entity.reset();
                }
            });
        } else if (e.key === " " && !background.gameStarted) {
            background.startGame(); 
        }
    });    

    gameEngine.start();
});
