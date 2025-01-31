// class Coin {
//     constructor(game) {
//         this.game = game;
//         this.animator = new Animator(
//             ASSET_MANAGER.getAsset("./Sprites/Background/coin.png"),
//             0, 0, 118, 130, 6, 0.1  
//         );
//         this.x = 0;
//         this.y = 0;
//         this.width = 50;
//         this.height = 50;
//         this.isCollected = false;  
//     }

//     getRandomPosition(minX, maxX, minY, maxY, obstacles, maxRetries = 10) {
//         let retries = 0;
//         let x, y;

//         while (retries < maxRetries) {
//             x = Math.random() * (maxX - minX - this.width) + minX;
//             y = Math.random() * (maxY - minY - this.height) + minY;

//             let collides = false;
//             for (let i = 0; i < obstacles.length; i++) {
//                 const obstacle = obstacles[i];
//                 if (x < obstacle.x + obstacle.width && x + this.width > obstacle.x &&
//                     y < obstacle.y + obstacle.height && y + this.height > obstacle.y) {
//                     collides = true;
//                     break;
//                 }
//             }

//             if (!collides) {
//                 return { x, y }; 
//             }

//             retries++;
//         }
//         return { x, y };
//     }

//     spawn(minX, maxX, minY, maxY, obstacles) {
//         let { x, y } = this.getRandomPosition(minX, maxX, minY, maxY, obstacles);
//         this.x = x;
//         this.y = y;
//     }
    
//     update() {
//         if (this.isCollected) {
            
//             this.removeFromWorld = true; 
//         }
//     }

//     draw(ctx) {
//         if (!this.isCollected) {
//             this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0.5); 
//         }
//     }

//     collect() {
//         this.isCollected = true;
//     }
// }

