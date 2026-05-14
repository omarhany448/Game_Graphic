 
let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

const BG_COLOR_DARK  = {r:185, g:125, b:25};
const BG_COLOR_LIGHT = {r:235, g:185, b:85};
const SHADOW_COLOR   = {r:160, g:100, b:10};
const PLAYER_COLOR   = {r:40,  g:30,  b:20};
const DOOR_COLOR     = {r:210, g:150, b:80};
const TEXT_COLOR     = "rgb(255,240,200)";

const GRAVITY        = 0.55;
const JUMP_FORCE     = -10;
const PLAYER_SPEED   = 5;
const PLAYER_W       = 28;
const PLAYER_H       = 30;
const PLATFORM_WIDTH = 120;
const PLATFORM_H     = 20;
const PLATFORM_GAP   = 80;
const PLATFORM_SPEED = 1.5;
const MARGIN_X       = 70;
const MARGIN_TOP     = 110;
const CONTAINER_HEIGHT = 240;

let GROUND_Y, CONTAINER_LEFT, CONTAINER_RIGHT, CONTAINER_W;

function updateDimensions() {
    WIDTH           = window.innerWidth;
    HEIGHT          = window.innerHeight;
    GROUND_Y        = MARGIN_TOP + CONTAINER_HEIGHT - 20;
    CONTAINER_LEFT  = MARGIN_X;
    CONTAINER_RIGHT = WIDTH - MARGIN_X;
    CONTAINER_W     = CONTAINER_RIGHT - CONTAINER_LEFT;
}

// ════════════════════════════════════════════════════════
// Player
// ════════════════════════════════════════════════════════
class Player {
    constructor(x) {
        this.x = x;
        this.y = GROUND_Y - PLAYER_H;
        this.w = PLAYER_W;
        this.h = PLAYER_H;
        this.velX = 0;
        this.velY = 0;
        this.onGround = true;
        this.currentPlatform = null;
    }

    handleInput(keys) {
        this.velX = 0;
        if (keys["ArrowLeft"]  || keys["a"] || keys["A"]) this.velX = -PLAYER_SPEED;
        if (keys["ArrowRight"] || keys["d"] || keys["D"]) this.velX =  PLAYER_SPEED;
    }

    jump() {
        if (this.onGround) { this.velY = JUMP_FORCE; this.onGround = false; }
    }

    update(platforms) {
        this.x += this.velX;
        if (this.x < CONTAINER_LEFT)           this.x = CONTAINER_LEFT;
        if (this.x + this.w > CONTAINER_RIGHT) this.x = CONTAINER_RIGHT - this.w;

        this.velY += GRAVITY;
        this.y    += this.velY;

        this.onGround = false;
        this.currentPlatform = null;

        for (let p of platforms) {
            if (p.offscreen) continue;
            if (this.x + this.w > p.x &&
                this.x          < p.x + p.w &&
                this.y + this.h <= p.y + 10 &&
                this.y + this.h >= p.y - 10 &&
                this.velY >= 0) {
                this.y = p.y - this.h;
                this.velY = 0;
                this.onGround = true;
                this.currentPlatform = p;
                break;
            }
        }

        if (this.y > HEIGHT + 100) return "fell";
        return null;
    }

    draw(ctx) {
        ctx.fillStyle = `rgb(${PLAYER_COLOR.r},${PLAYER_COLOR.g},${PLAYER_COLOR.b})`;
        ctx.fillRect(this.x, this.y, this.w, this.h);

        const ey = this.y + 8;
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(this.x + 8,          ey, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(this.x + this.w - 8, ey, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "black";
        ctx.beginPath(); ctx.arc(this.x + 9,          ey, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(this.x + this.w - 7, ey, 2, 0, Math.PI*2); ctx.fill();
    }

    rect() {
        return { l: this.x, r: this.x + this.w, t: this.y, b: this.y + this.h };
    }
}

// ════════════════════════════════════════════════════════
// Platform
// ════════════════════════════════════════════════════════
class Platform {
    constructor(startX, y) {
        this.startX    = startX;
        this.x         = startX;
        this.y         = y;
        this.w         = PLATFORM_WIDTH;
        this.h         = PLATFORM_H;
        this.offscreen = false;
    }

    update(offset, clampLeft) {
        this.x = this.startX + offset;
        if (clampLeft && this.x < CONTAINER_LEFT) this.x = CONTAINER_LEFT;
        // fully inside right wall → treat as gone
        this.offscreen = (this.x >= CONTAINER_RIGHT);
    }

    draw(ctx) {
        if (this.offscreen) return;

        // clip so platform visually slides into the right wall
        ctx.save();
        ctx.beginPath();
        ctx.rect(CONTAINER_LEFT, 0, CONTAINER_W, HEIGHT);
        ctx.clip();

        ctx.fillStyle   = `rgb(${BG_COLOR_DARK.r},${BG_COLOR_DARK.g},${BG_COLOR_DARK.b})`;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = `rgb(${SHADOW_COLOR.r},${SHADOW_COLOR.g},${SHADOW_COLOR.b})`;
        ctx.lineWidth   = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        ctx.restore();
    }
}

// ════════════════════════════════════════════════════════
// Door
// ════════════════════════════════════════════════════════
class Door {
    constructor(x, y) { this.x = x; this.y = y; this.w = 50; this.h = 60; }

    draw(ctx) {
        ctx.fillStyle   = `rgb(${DOOR_COLOR.r},${DOOR_COLOR.g},${DOOR_COLOR.b})`;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = `rgb(${SHADOW_COLOR.r},${SHADOW_COLOR.g},${SHADOW_COLOR.b})`;
        ctx.lineWidth   = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle   = "rgb(200,150,100)";
        ctx.beginPath();
        ctx.arc(this.x + this.w - 10, this.y + this.h / 2, 4, 0, Math.PI*2);
        ctx.fill();
    }

    rect() { return { l: this.x, r: this.x + this.w, t: this.y, b: this.y + this.h }; }
}

// ════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════
function drawBg(ctx) {
    ctx.fillStyle = `rgb(${BG_COLOR_DARK.r},${BG_COLOR_DARK.g},${BG_COLOR_DARK.b})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = `rgb(${BG_COLOR_LIGHT.r},${BG_COLOR_LIGHT.g},${BG_COLOR_LIGHT.b})`;
    ctx.fillRect(CONTAINER_LEFT, MARGIN_TOP, CONTAINER_W, CONTAINER_HEIGHT);
    const gy = MARGIN_TOP + CONTAINER_HEIGHT - 20;
    ctx.fillRect(CONTAINER_LEFT, gy, CONTAINER_W, HEIGHT - gy);
}

function drawOverlay(ctx, title, sub) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = "center";
    ctx.font      = "bold 40px Arial";
    ctx.fillText(title, WIDTH / 2, HEIGHT / 2 - 30);
    if (sub) {
        ctx.font = "22px Arial";
        ctx.fillText(sub, WIDTH / 2, HEIGHT / 2 + 20);
    }
}

function rectsCollide(a, b) {
    return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
}

// ════════════════════════════════════════════════════════
// Game
// ════════════════════════════════════════════════════════
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx    = this.canvas.getContext("2d");
        updateDimensions();
        this.canvas.width  = WIDTH;
        this.canvas.height = HEIGHT;

        this.keys  = {};
        this.state = "start";
        this.reset();
        this.setupEvents();
        this.gameLoop();
    }

    reset() {
        updateDimensions();
        this.canvas.width  = WIDTH;
        this.canvas.height = HEIGHT;

        this.platforms = [];
        const py    = GROUND_Y;
        const space = CONTAINER_W - PLATFORM_WIDTH - PLATFORM_WIDTH - PLATFORM_GAP - PLATFORM_GAP;
        const mid   = Math.max(2, Math.floor(space / (PLATFORM_WIDTH + PLATFORM_GAP)));
        const total = mid + 1;

        let cx = CONTAINER_RIGHT - PLATFORM_WIDTH;
        for (let i = 0; i < total; i++) {
            this.platforms.push(new Platform(cx, py));
            cx -= (PLATFORM_WIDTH + PLATFORM_GAP);
        }

        this.staticPlatform = new Platform(CONTAINER_LEFT, py);
        this.door           = new Door(CONTAINER_LEFT + PLATFORM_WIDTH / 2 - 25, py - 60);

        this.distance   = 0;
        this.direction  = -1;
        this.dirChanged = false;
        this.player     = null;
    }

    initPlayer() {
        const fp    = this.platforms[0];
        this.player = new Player(fp.x + fp.w / 2 - PLAYER_W / 2);
    }

    setupEvents() {
        const act = () => {
            if (this.state === "start" || this.state === "gameover" || this.state === "win") {
                this.reset();
                this.initPlayer();
                this.state = "playing";
            } else if (this.state === "playing") {
                this.player.jump();
            }
        };

        document.addEventListener("keydown", (e) => {
            this.keys[e.key] = true;
            if (["Space","Enter","ArrowUp"].includes(e.code) || e.key === "w" || e.key === "W") act();
        });
        document.addEventListener("keyup",  (e) => { this.keys[e.key] = false; });
        window.addEventListener("resize",   () => { this.reset(); if (this.state === "playing") this.initPlayer(); });
    }

    countOverlaps() {
        let count = 0;
        for (let p of this.platforms) {
            if (Math.round(p.x) === CONTAINER_LEFT &&
                Math.round(p.x + p.w) === CONTAINER_LEFT + PLATFORM_WIDTH) {
                count++;
            }
        }
        return count;
    }

    update() {
        if (this.state !== "playing" || !this.player) return;

        this.player.handleInput(this.keys);

        this.distance += PLATFORM_SPEED * this.direction;

        const goingRight = (this.direction === 1);

        for (let p of this.platforms) {
            // going left  → clamp left wall
            // going right → NO clamp, slide into right wall
            p.update(this.distance, !goingRight);
        }

        // trigger reverse when 2 platforms fully overlap static platform
        if (!this.dirChanged && this.countOverlaps() >= 2) {
            this.dirChanged = true;
            this.direction  = 1;
        }

        // drag player along standing platform
        if (this.player.currentPlatform && this.player.onGround) {
            this.player.x += PLATFORM_SPEED * this.direction;
            if (this.player.x < CONTAINER_LEFT)           this.player.x = CONTAINER_LEFT;
            if (this.player.x + this.player.w > CONTAINER_RIGHT) this.player.x = CONTAINER_RIGHT - this.player.w;
        }

        const all    = [...this.platforms, this.staticPlatform];
        const result = this.player.update(all);
        if (result === "fell") this.state = "gameover";

        // if (rectsCollide(this.player.rect(), this.door.rect())) this.state = "win";


        if (rectsCollide(this.player.rect(), this.door.rect())) {

            this.state = "win";

            setTimeout(() => {
                window.location.href = "level-devil_gui.html";
            }, 1500);
        }
    }

    draw() {
        drawBg(this.ctx);
        for (let p of this.platforms) p.draw(this.ctx);
        this.staticPlatform.draw(this.ctx);
        this.door.draw(this.ctx);
        if (this.player) this.player.draw(this.ctx);

        if (this.state === "start")    drawOverlay(this.ctx, "Level 27",   "اضغط مفتاح المسافة للبدء");
        if (this.state === "gameover") drawOverlay(this.ctx, "Game Over!", "اضغط مفتاح المسافة للعب مجدداً");
        if (this.state === "win")      drawOverlay(this.ctx, "Win!",       "اضغط مفتاح المسافة للعب مجدداً");
    }

    gameLoop = () => {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }
}

const game = new Game("gameCanvas");
 
