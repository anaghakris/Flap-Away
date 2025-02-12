class StartPage {
    constructor(game) {
        this.game = game;
        this.options = ["Play", "How to Play", "Creators"];
        this.selectedOption = 0;
        
        this.menuStartY = 250;
        this.menuSpacing = 50;
        this.menuItemHeight = 30;
        this.menuItemWidth = 200;

        this.backgroundImage = ASSET_MANAGER.getAsset("./Sprites/Background/Daytime.png");
        
        this.showingInfo = false;
        this.infoText = [];
    }

    update() {
        if (this.game.mouse) {
            const mouseY = this.game.mouse.y;
            for (let i = 0; i < this.options.length; i++) {
                const itemY = this.menuStartY + (i * this.menuSpacing);
                if (mouseY >= itemY - this.menuItemHeight/2 && 
                    mouseY <= itemY + this.menuItemHeight/2 &&
                    this.game.mouse.x >= this.game.ctx.canvas.width/2 - this.menuItemWidth/2 &&
                    this.game.mouse.x <= this.game.ctx.canvas.width/2 + this.menuItemWidth/2) {
                    this.selectedOption = i;
                }
            }
        }

        if (this.game.keys["ArrowDown"]) {
            this.selectedOption = (this.selectedOption + 1) % this.options.length;
            this.game.keys["ArrowDown"] = false; 
        }
        if (this.game.keys["ArrowUp"]) {
            this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
            this.game.keys["ArrowUp"] = false; 
        }
        if (this.game.keys["Enter"]) {
            if (this.showingInfo) {
                this.showingInfo = false;
                this.infoText = [];
            } else {
                this.handleOptionSelection(this.selectedOption);
            }
            this.game.keys["Enter"] = false; 
        }

        if (this.game.click) {
            const clickY = this.game.click.y;
            for (let i = 0; i < this.options.length; i++) {
                const itemY = this.menuStartY + (i * this.menuSpacing);
                if (clickY >= itemY - this.menuItemHeight/2 && 
                    clickY <= itemY + this.menuItemHeight/2 &&
                    this.game.click.x >= this.game.ctx.canvas.width/2 - this.menuItemWidth/2 &&
                    this.game.click.x <= this.game.ctx.canvas.width/2 + this.menuItemWidth/2) {
                    this.handleOptionSelection(i);
                }
            }
            this.game.click = null;
        }
    }

    handleOptionSelection(option) {
        switch (option) {
            case 0: 
                const background = new Background(this.game);
                const bird = new Bird(this.game);
                
                this.game.entities = []; 
                this.game.addEntity(bird);
                this.game.addEntity(background);
                
                this.game.gameOver = false;
                
                this.removeFromWorld = true;
                
                background.gameStarted = false;  
                
                this.game.ctx.canvas.addEventListener("keydown", (e) => {
                    if (e.key === " " && !background.gameStarted) {
                        background.startGame();
                        bird.startGame();
                    }
                });
                break;
                
            case 1: 
                const howToPlayText = [
                    "HOW TO PLAY",
                    "",
                    "• Press SPACE to make the bird flap",
                    "• Navigate through pipes to score points",
                    "• Avoid hitting the pipes and plants",
                    "• Collect coins for extra rewards",
                    "• Try to beat your high score!",
                    "• Watch out for snapping plants",
                    "",
                    "Press ENTER to return to menu"
                ];
                
                this.showInfoScreen(howToPlayText);
                break;
                
            case 2: 
                const creatorsText = [
                    "CREATORS",
                    "",
                    "• Binal Dhaliwal",
                    "• Anagha Krishna",
                    "• Bhavneet Bhargava",
                    "",
                    "A Flappy Bird Inspired Game",
                    "",
                    "Press ENTER to return to menu"
                ];
                
                this.showInfoScreen(creatorsText);
                break;
        }
    }

    showInfoScreen(text) {
        this.showingInfo = true;
        this.infoText = text;
    }

    draw(ctx) {
        ctx.drawImage(this.backgroundImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
        
        if (this.showingInfo) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            let startY = 150;
            const lineHeight = 40;
            
            ctx.textAlign = "center";
            
            this.infoText.forEach((line, index) => {
                if (index === 0) {
                    ctx.font = "32px 'Press Start 2P', monospace";
                    ctx.fillStyle = "#FFD700";
                } else if (line === "") {
                    startY += lineHeight/2;
                    return;
                } else if (line.includes("Press ENTER")) {
                    ctx.font = "16px 'Press Start 2P', monospace";
                    ctx.fillStyle = "#AAAAAA";
                } else {
                    ctx.font = "16px 'Press Start 2P', monospace";
                    ctx.fillStyle = "#FFFFFF";
                }
                
                ctx.fillText(line, ctx.canvas.width/2, startY);
                startY += lineHeight;
            });
            
            return;
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.font = "48px 'Press Start 2P', monospace";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.fillText("Flap Away", ctx.canvas.width/2, 150);

        ctx.font = "24px 'Press Start 2P', monospace";
        
        for (let i = 0; i < this.options.length; i++) {
            const y = this.menuStartY + (i * this.menuSpacing);

            if (i === this.selectedOption) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
                ctx.fillRect(
                    ctx.canvas.width/2 - this.menuItemWidth/2,
                    y - this.menuItemHeight/2,
                    this.menuItemWidth,
                    this.menuItemHeight
                );
                ctx.fillStyle = "#FFD700"; 
            } else {
                ctx.fillStyle = "#FFFFFF";
            }

            ctx.fillText(this.options[i], ctx.canvas.width/2, y);

            if (i === this.selectedOption) {
                ctx.font = "32px 'Press Start 2P', monospace";  
                ctx.fillText(">>>>", ctx.canvas.width/2 - this.menuItemWidth/1 - 60, y);
                ctx.fillText("<<<<", ctx.canvas.width/2 + this.menuItemWidth/1 + 60, y);
                ctx.font = "24px 'Press Start 2P', monospace"; 
            }
        }

        ctx.font = "16px 'Press Start 2P', monospace";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("Use ↑↓ arrows to select, ENTER to confirm", ctx.canvas.width/2, ctx.canvas.height - 50);
    }
}