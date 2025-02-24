class BackgroundLevel2 extends BaseBackground {
    constructor(game) {
        const assets = {
            background: "./Sprites/Background/NightCity.png",
            base: "./Sprites/Background/base_night.png",
            pipe: "./Sprites/Pipes/night_pipe.png",
            topPipe: "./Sprites/Pipes/night_pipe.png"
        };
        super(game, 2, assets);
        
        let bird = this.getBird();
        if (bird) {
            bird.sprite = ASSET_MANAGER.getAsset("./Sprites/Bird/bluebird_sprite_sheet.png");
        }
        const coinType = game.selectedCoinType || 'default';
        let coinCount = coinType === 'custom' ? 2 : 15;
        this.coinProgress = new CoinProgress(game, 800, coinCount);
    }

    updateBestScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('flappyBestScore', this.bestScore);
        }
    }

    update() {
        super.update();
        this.updateBestScore();
    }
}