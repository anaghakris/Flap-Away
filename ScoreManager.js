class ScoreManager {
    constructor(game) {
        this.game = game;
        this.pointSound = ASSET_MANAGER.getAsset("./audio/sfx_point.wav");
        this.pointSound.volume = 0.3;
        this.lastSoundTime = 0;
        this.MIN_SOUND_INTERVAL = 150;
    }

    playPointSound() {
        const currentTime = Date.now();
        if (currentTime - this.lastSoundTime >= this.MIN_SOUND_INTERVAL) {
            this.pointSound.currentTime = 0;
            this.pointSound.play();
            this.lastSoundTime = currentTime;
        }
    }

    updateScore(bird, pipe) {
        if (!pipe.passed && bird.x > pipe.x + pipe.width && pipe.type === 'top') {
            pipe.passed = true;
            bird.score++;
            this.playPointSound();
        }
    }

    updateBestScore(currentScore) {
        const bestScore = parseInt(localStorage.getItem('bestScore') || '0');
        if (currentScore > bestScore) {
            localStorage.setItem('bestScore', currentScore.toString());
        }
    }

    getBestScore() {
        return parseInt(localStorage.getItem('bestScore') || '0');
    }
}