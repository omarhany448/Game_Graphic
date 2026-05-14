const player = document.getElementById('player');
const level = document.getElementById('level-layout');

// ===== Player =====
let playerPos = { x: 70, y: 2 };

let velocityY = 0;

let isDead = false;
let isWon = false;

const gravity = 0.5;
const jumpPower = -10;
const moveSpeed = 0.7;

const keys = {};

// ===== Rotation =====
let rotation = 0;

// ===== Double Jump =====
let jumpCount = 2;

const maxJumps = 2;

let canJump = true;

// ===== First Spike =====
let dynamicSpikeX = 40;

let hasMoved = false;

const firstSpikeFastSpeed = 2;
const firstSpikeSlowSpeed = 0.2;

// ===== Second Spike =====
let secondSpikeActivated = false;

let secondSpikeX = 70;

const secondSpikeSpeed = 1.2;

// ===== New Move =====
let secondSpikeShifted = false;

// ===== Controls =====
window.addEventListener('keydown', e => {

    keys[e.code] = true;

    if (
        (e.code === 'Space' || e.code === 'ArrowUp')
        && canJump
        && !isDead
        && !isWon
    ) {
        if (jumpCount > 0) {
            velocityY = jumpPower;
            jumpCount--;
            canJump = false;
        }
    }
});

window.addEventListener('keyup', e => {

    keys[e.code] = false;

    if (
        e.code === 'Space'
        || e.code === 'ArrowUp'
    ) {
        canJump = true;
    }
});

// =========== shake =============
const gameContainer = document.querySelector('.game-container');

function triggerShake() {
    gameContainer.classList.add('shake');

    setTimeout(() => {
        gameContainer.classList.remove('shake');
    }, 100);
}

// ===== Collision =====
function checkSpikeCollision() {

    if (isDead || isWon) return;

    const spikes = document.querySelectorAll('.spike-group');
    const playerRect = player.getBoundingClientRect();

    spikes.forEach(spike => {

        const spikeRect = spike.getBoundingClientRect();

        if (
            playerRect.left < spikeRect.right &&
            playerRect.right > spikeRect.left &&
            playerRect.top < spikeRect.bottom &&
            playerRect.bottom > spikeRect.top
        ) {
            isDead = true;

            triggerShake();

            setTimeout(() => {
                resetGame();
                isDead = false;
            }, 0);
        }
    });
}


// ===== Door Win =====
function checkDoorCollision() {

    if (isDead || isWon) return;

    const door = document.querySelector('.door');

    const playerRect = player.getBoundingClientRect();
    const doorRect = door.getBoundingClientRect();

    if (
        playerRect.left < doorRect.right &&
        playerRect.right > doorRect.left &&
        playerRect.top < doorRect.bottom &&
        playerRect.bottom > doorRect.top
    ) {
        winGame();
    }
}

function winGame() {

    if(isWon) return;

    isWon = true;
    velocityY = 0;

    triggerShake();

    const door = document.querySelector('.door');
    door.style.pointerEvents = "none";

    // setTimeout(() => {
    //     alert(" You Win!");

    //     // <div id="winScreen" class="win-screen hidden">
    //     //     <i class="fa-solid fa-trophy"></i>
    //     //     <h2>You Win!</h2>
    //     // </div>

    //     resetGame();

    //     door.style.pointerEvents = "auto";

    //     isWon = false;

    // }, 0);

    setTimeout(() => {

        window.location.href = "level_11.html";

    }, 1000);
}

// ===== Reset =====
function resetGame() {

    playerPos = { x: 70, y: 2 };

    velocityY = 0;

    jumpCount = maxJumps;

    rotation = 0;

    // First Spike
    dynamicSpikeX = 40;

    hasMoved = false;

    const dynamicSpike =
        document.querySelector('.dynamic-spike');

    if (dynamicSpike) {
        dynamicSpike.style.left = "40%";
    }

    // Second Spike
    secondSpikeActivated = false;

    secondSpikeShifted = false;

    secondSpikeX = 70;

    const secondSpike =
        document.querySelector('.second-spike');

    if (secondSpike) {
        secondSpike.style.left = "70%";
    }

    console.log("Restart");
}

// ===== First Spike =====
function handleDynamicSpikes() {

    const dynamicSpike =
        document.querySelector('.dynamic-spike');

    if (!dynamicSpike) return;

    const spikeRect =
        dynamicSpike.getBoundingClientRect();

    const playerRect =
        player.getBoundingClientRect();

    const spikeMidY =
        spikeRect.top + spikeRect.height / 2;

    const playerMidY =
        playerRect.top + playerRect.height / 2;

    if (!hasMoved && playerMidY >= spikeMidY) {

        dynamicSpikeX -= firstSpikeFastSpeed;

        dynamicSpike.style.left =
            dynamicSpikeX + "%";

        hasMoved = true;
    }

    if (playerRect.left <= spikeRect.right + 50) {

        dynamicSpikeX -= firstSpikeSlowSpeed;

        dynamicSpike.style.left =
            dynamicSpikeX + "%";
    }
}

// ===== Second Spike =====
function moveSecondSpike() {

    if (!secondSpikeActivated) return;

    const secondSpike =
        document.querySelector('.second-spike');

    if (!secondSpike) return;

    secondSpikeX -= secondSpikeSpeed;

    if (secondSpikeX <= 30) {
        secondSpikeX = 30;
    }

    secondSpike.style.left =
        secondSpikeX + "%";
}

// ===== Shift Spike =====
function shiftSecondSpikeLeft() {

    if (secondSpikeShifted) return;

    const secondSpike =
        document.querySelector('.second-spike');

    if (!secondSpike) return;

    if (playerPos.x <= 73) {

        secondSpikeX -= 6;

        secondSpike.style.left =
            secondSpikeX + "%";

        secondSpikeShifted = true;
    }
}

// ===== Update =====
function update() {

    if (isDead || isWon) {
        requestAnimationFrame(update);
        return;
    }

    const w = level.clientWidth;
    const h = level.clientHeight;

    const pW =
        (player.offsetWidth / w) * 100;

    const pH =
        (player.offsetHeight / h) * 100;

    // Movement
    if (keys['ArrowLeft'] || keys['KeyA']) {
        playerPos.x -= moveSpeed;
    }

    if (keys['ArrowRight'] || keys['KeyD']) {
        playerPos.x += moveSpeed;
    }

    // Gravity
    velocityY += gravity;
    playerPos.y += velocityY * 0.2;

    if (velocityY !== 0) {
        rotation += 10;
        if (rotation >= 360) rotation = 0;
    }

    checkSpikeCollision();
    checkDoorCollision();

    handleDynamicSpikes();
    shiftSecondSpikeLeft();
    moveSecondSpike();

    const middleY = 30 - pH;

    if (playerPos.x <= 90 - (pW / 2)) {

        if (
            playerPos.y >= middleY &&
            velocityY >= 0 &&
            playerPos.y <= middleY + 5
        ) {
            playerPos.y = middleY;
            velocityY = 0;
            jumpCount = maxJumps;
            rotation = 0;
        }
    }

    const groundY = 100 - pH;

    if (playerPos.y >= groundY) {
        playerPos.y = groundY;
        velocityY = 0;
        jumpCount = maxJumps;
        rotation = 0;
    }

    if (playerPos.x < 0) playerPos.x = 0;
    if (playerPos.x > 100 - pW) playerPos.x = 100 - pW;

    const wallX = 63;

    if (playerPos.y <= middleY && playerPos.x < wallX) {
        playerPos.x = wallX;
    }

    const triggerX = 55;

    if (!secondSpikeActivated && playerPos.x < triggerX) {
        secondSpikeActivated = true;
    }

    player.style.left = playerPos.x + "%";
    player.style.top = playerPos.y + "%";
    player.style.transform = `rotate(${rotation}deg)`;

    requestAnimationFrame(update);
}
update();