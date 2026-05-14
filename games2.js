// ════════════════════════════════════════════════════════════════════════════════
// Game Constants
// ════════════════════════════════════════════════════════════════════════════════

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

// Colors
const BG_COLOR = { r: 200, g: 140, b: 20 };          // بني ذهبي غامق
const PLATFORM_COLOR = { r: 230, g: 180, b: 60 };    // بني ذهبي فاتح
const PLAYER_COLOR = { r: 40, g: 30, b: 20 };        // أسود
const DOOR_COLOR = { r: 210, g: 150, b: 80 };        // بني فاتح
const TEXT_COLOR = "rgb(255, 240, 200)";
const SHADOW_COLOR = { r: 160, g: 100, b: 10 };      // بني غامق

// Game Settings
const GRAVITY = 0.55;
const JUMP_FORCE = -8;
const PLAYER_SPEED = 5;
const GROUND_Y = 320;
const PLATFORM_H = 20;
const PLAYER_W = 28;
const PLAYER_H = 30;

// ════════════════════════════════════════════════════════════════════════════════
// Player Class
// ════════════════════════════════════════════════════════════════════════════════

class Player {
    constructor() {
        this.x = 120;
        this.y = GROUND_Y - PLAYER_H;
        this.width = PLAYER_W;
        this.height = PLAYER_H;
        this.velY = 0;
        this.velX = 0;
        this.onGround = false;
        this.inHole = false;
    }

    handleInput(keys, inHole = false) {
        this.velX = 0;
        if (!inHole) {
            if (keys["ArrowLeft"]) {
                this.velX = -PLAYER_SPEED;
            }
            if (keys["ArrowRight"]) {
                this.velX = PLAYER_SPEED;
            }
        }
    }

    jump() {
        if (this.onGround && !this.inHole) {
            this.velY = JUMP_FORCE;
            this.onGround = false;
        }
    }

    update(gapX, gapW) {
        // Horizontal movement
        this.x += this.velX;

        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > WIDTH) {
            this.x = WIDTH - this.width;
        }

        // Gravity
        this.velY += GRAVITY;
        this.y += this.velY;

        this.onGround = false;

        // Ground collision
        if (this.y + this.height >= GROUND_Y) {
            const centerX = this.x + this.width / 2;
            // Check if over the gap
            if (gapX < centerX && centerX < gapX + gapW) {
                // Fell in the gap
                this.inHole = true;
            } else {
                // Normal ground
                this.y = GROUND_Y - this.height;
                this.velY = 0;
                this.onGround = true;
                this.inHole = false;
            }
        }

        // Fell off screen
        if (this.y > HEIGHT) {
            return "fell";
        }

        return null;
    }

    draw(ctx) {
        // Body
        this.drawRoundRect(ctx, this.x, this.y, this.width, this.height, 4, PLAYER_COLOR);

        // Eyes
        const eyeY = this.y + 8;
        
        // White circles
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.beginPath();
        ctx.arc(this.x + 8, eyeY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x + this.width - 8, eyeY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Black pupils
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.beginPath();
        ctx.arc(this.x + 9, eyeY, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x + this.width - 7, eyeY, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRoundRect(ctx, x, y, w, h, radius, color) {
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }
}

// ════════════════════════════════════════════════════════════════════════════════
// Obstacle Class
// ════════════════════════════════════════════════════════════════════════════════

class Obstacle {
    constructor(gapX, gapW) {
        this.gapX = gapX;
        this.gapW = gapW;
        this.x = gapX + gapW + 50;
        this.y = GROUND_Y;
        this.width = 40;
        this.height = 0;
        this.state = "rising";
        this.riseSpeed = 6;
        this.moveSpeed = 2;
        this.fallSpeed = 4;
        this.targetHeight = 120;
    }

    update() {
        if (this.state === "rising") {
            if (this.height < this.targetHeight) {
                this.height += this.riseSpeed;
                this.y = GROUND_Y - this.height;
            } else {
                this.state = "moving";
            }
        } else if (this.state === "moving") {
            if (this.x > this.gapX + 115) {
                this.x -= this.moveSpeed;
            } else {
                this.x = this.gapX + 115;
                this.state = "falling";
            }
        } else if (this.state === "falling") {
            if (this.y < GROUND_Y) {
                this.y += this.fallSpeed;
                this.height -= this.fallSpeed;
            } else {
                this.state = "done";
            }
        }
    }

    draw(ctx) {
        // الركيزة/العمود
        ctx.fillStyle = "rgb(180, 130, 50)";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // حدود أغمق
        ctx.strokeStyle = "rgb(140, 100, 40)";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }
}

// ════════════════════════════════════════════════════════════════════════════════
// Door Class
// ════════════════════════════════════════════════════════════════════════════════

class Door {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 60;
    }

    draw(ctx) {
        // Door body
        ctx.fillStyle = `rgb(${DOOR_COLOR.r}, ${DOOR_COLOR.g}, ${DOOR_COLOR.b})`;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Door border
        ctx.strokeStyle = `rgb(${SHADOW_COLOR.r}, ${SHADOW_COLOR.g}, ${SHADOW_COLOR.b})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Door knob
        ctx.fillStyle = "rgb(200, 150, 100)";
        ctx.beginPath();
        ctx.arc(this.x + this.width - 10, this.y + this.height / 2, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }
}

// ════════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ════════════════════════════════════════════════════════════════════════════════

function drawBackground(ctx) {
    const bgColor = "rgb(185, 125, 25)";
    const lightColor = "rgb(235, 185, 85)";

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const marginX = 70;
    const marginTop = 110;
    const mainW = WIDTH - marginX * 2;
    const mainH = 240;

    const mainX = marginX;
    const mainY = marginTop;

    ctx.fillStyle = lightColor;
    ctx.fillRect(mainX, mainY, mainW, mainH);

    const groundY = mainY + mainH - 20;

    // Gap info
    const gapW = 115;
    const gapX = WIDTH / 2 - gapW / 2;

    const lift = 12;
    const topEdgeY = groundY - lift;

    // Ground before gap
    ctx.fillStyle = lightColor;
    ctx.fillRect(mainX, groundY, gapX - mainX, HEIGHT - groundY);

    // Ground after gap
    ctx.fillRect(gapX + gapW, groundY, mainX + mainW - (gapX + gapW), HEIGHT - groundY);

    // The gap itself
    ctx.fillRect(gapX, groundY, gapW, HEIGHT - groundY);

    // Left wall
    ctx.fillStyle = bgColor;
    ctx.fillRect(mainX, topEdgeY, gapX - mainX, HEIGHT - topEdgeY);

    // Right wall
    ctx.fillRect(gapX + gapW, topEdgeY, mainX + mainW - (gapX + gapW), HEIGHT - topEdgeY);

    return { gapX, gapW };
}

function drawScreenCenter(ctx, title, subtitle = "") {
    // Semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Title
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText(title, WIDTH / 2, HEIGHT / 2 - 30);

    // Subtitle
    if (subtitle) {
        ctx.font = "22px Arial";
        ctx.fillText(subtitle, WIDTH / 2, HEIGHT / 2 + 20);
    }
}

function rectsCollide(rect1, rect2) {
    return rect1.left < rect2.right &&
           rect1.right > rect2.left &&
           rect1.top < rect2.bottom &&
           rect1.bottom > rect2.top;
}

// ════════════════════════════════════════════════════════════════════════════════
// Main Game
// ════════════════════════════════════════════════════════════════════════════════

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext("2d");
        
        this.player = new Player();
        this.door = new Door(WIDTH - 140, GROUND_Y - 60);
        this.obstacle = null;
        this.obstacleTriggered = false;
        this.state = "start";
        this.keys = {};

        this.setupEventListeners();
        this.gameLoop();
    }

    setupEventListeners() {
        // Update canvas size when window resizes
        window.addEventListener('resize', () => {
            WIDTH = window.innerWidth;
            HEIGHT = window.innerHeight;
            this.canvas.width = WIDTH;
            this.canvas.height = HEIGHT;
        });

        window.addEventListener("keydown", (e) => {
            this.keys[e.key] = true;

            if (e.key === "Escape") {
                if (this.state !== "start") {
                    this.state = "start";
                }
            }

            if (this.state === "start" && (e.code === "Space" || e.code === "Enter")) {
                this.resetGame();
                this.state = "playing";
            } else if (this.state === "playing" && (e.code === "Space" || e.key === "ArrowUp" || e.key === "w" || e.key === "W")) {
                this.player.jump();
            } else if ((this.state === "gameover" || this.state === "win") && (e.code === "Space" || e.code === "Enter")) {
                this.resetGame();
                this.state = "playing";
            }
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.key] = false;
        });
    }

    resetGame() {
        this.player = new Player();
        this.obstacle = null;
        this.obstacleTriggered = false;
    }

    update() {
        if (this.state !== "playing") return;

        const { gapX, gapW } = this.getGapInfo();

        // Handle input
        this.player.handleInput(this.keys, this.player.inHole);

        // Update player
        const result = this.player.update(gapX, gapW);
        
        if (result === "fell") {
            this.state = "gameover";
        }

        // Trigger obstacle when player crosses gap
        if (!this.obstacleTriggered && this.player.x + this.player.width / 2 > gapX + gapW) {
            this.obstacleTriggered = true;
            this.obstacle = new Obstacle(gapX, gapW);
        }

        // Update obstacle
        if (this.obstacle) {
            this.obstacle.update();

            // Push player left towards the gap
            if (rectsCollide(this.player.getRect(), this.obstacle.getRect())) {
                this.player.x -= 10;
                this.player.velY = 5;
                this.player.onGround = false;
                this.player.inHole = false;
            }
        }

        // Check door collision
        // if (rectsCollide(this.player.getRect(), this.door.getRect())) {
        //     this.state = "win";
        // }


        if (rectsCollide(this.player.getRect(), this.door.getRect())) {

            this.state = "win";

            setTimeout(() => {
                window.location.href = "level_27.html";
            }, 1000);
        }
    }

    draw() {
        const { gapX, gapW } = this.getGapInfo();
        drawBackground(this.ctx);

        this.door.draw(this.ctx);
        
        if (this.obstacle) {
            this.obstacle.draw(this.ctx);
        }

        this.player.draw(this.ctx);

        // Draw UI
        if (this.state === "start") {
            drawScreenCenter(this.ctx, "Devil", "اضغط مفتاح المسافة للبدء");
        } else if (this.state === "gameover") {
            drawScreenCenter(this.ctx, "Game over!", "اضغط مفتاح المسافة لتشغيل اللعبة مجدداً");
        } else if (this.state === "win") {
            drawScreenCenter(this.ctx, "Win", "اضغط مفتاح المسافة لتشغيل اللعبة مجدداً");
        }
    }

    getGapInfo() {
        const marginX = 70;
        const marginTop = 110;
        const mainW = WIDTH - marginX * 2;
        const mainH = 240;
        const mainY = marginTop;
        
        const groundY = mainY + mainH - 20;
        
        const gapW = 115;
        const gapX = WIDTH / 2 - gapW / 2;

        return { gapX, gapW };
    }

    gameLoop = () => {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }
}

// Initialize the game when DOM is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        new Game("gameCanvas");
    });
} else {
    new Game("gameCanvas");
}
