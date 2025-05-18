const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 832;
const CANVAS_HEIGHT = canvas.height = 556;
let gameSpeed = 6;

const backgroundLayer1 = new Image();
backgroundLayer1.src = 'poz1.png';
const backgroundLayer2 = new Image();
backgroundLayer2.src = 'poz2.png';
const backgroundLayer3 = new Image();
backgroundLayer3.src = 'poz3.png';
const backgroundLayer4 = new Image();
backgroundLayer4.src = 'poz4.png';
const backgroundLayer5 = new Image();
backgroundLayer5.src = 'poz5.png';
const backgroundLayer6 = new Image();
backgroundLayer6.src = 'poz6.png';

// const playerImage = new Image();
// playerImage.src = 'krug.png';
const PLAYER_FRAMES = 5; // Number of animation frames
let playerImages = [];
let playerImageIndex = 0;

// Preload all player animation frames ONCE
for (let i = 0; i < PLAYER_FRAMES; i++) {
    let img = new Image();
    img.src = `kocka${i}.png`; // Make sure your files are named krug0.png, krug1.png, ..., krug9.png
    playerImages.push(img);
}

let playerHeight = 48;
let playerWidth = 48;
let playerX = CANVAS_WIDTH/8;
let playerY = CANVAS_HEIGHT/2;

let player= {
    x: playerX,
    y: playerY,
    width: playerWidth,
    height: playerHeight
}

let pipeArray = [];
let pipeHeight = CANVAS_HEIGHT;
let pipeWidth = pipeHeight * (66 / 460);
let pipeX = CANVAS_WIDTH;
let pipeY = 0;
let topPipeImg = new Image();
topPipeImg.src = 'pipeTop.png'
let bottomPipeImg = new Image();
bottomPipeImg.src = 'pipe.png';

let velocityX = -2;
let velocityY = 0;
let gravity = 0.3;

let gameOver = false;
let score = 0;

// Add these variables near your animation variables:
let playerAnimFrameCounter = 0;
const PLAYER_ANIM_FPS = 8; // Lower FPS (e.g., 8 frames per second)
const PLAYER_ANIM_INTERVAL = Math.floor(60 / PLAYER_ANIM_FPS); // Assuming 60fps game loop

let gameStarted = false;
let gamePaused = true;

class Layer 
{
    constructor(image, speedModifier)
    {
        this.x = 0;
        this.y = 0;
        this.width = 832;
        this.height = 556;
        this.x2 = this.width;
        this.image = image;
        this.speedModifier = speedModifier;
        this.speed = gameSpeed * this.speedModifier;
    }

    update()
    {
        this.speed = gameSpeed * this.speedModifier;
        if (this.x <= -this.width) 
        {
            this.x = this.width + this.x2 - this.speed;
        }
        if (this.x2 <= -this.width) 
        {
            this.x2 = this.width + this.x - this.speed;
        }
        this.x = Math.floor(this.x - this.speed);
        this.x2 = Math.floor(this.x2 - this.speed);
    }

    draw()
    {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x2, this.y, this.width, this.height);
    }
}

const layer1 = new Layer(backgroundLayer1, 0);
const layer2 = new Layer(backgroundLayer2, 0);
const layer3 = new Layer(backgroundLayer3, 0.1);
const layer4 = new Layer(backgroundLayer4, 0.2);
const layer5 = new Layer(backgroundLayer5, 0.3);
const layer6 = new Layer(backgroundLayer6, 0.4);

const gameObjects = [layer1, layer2, layer3, layer4, layer5, layer6];

function animate() 
{
    if (gamePaused) return;

    if (gameOver)
    {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over", CANVAS_WIDTH / 2 - 50, CANVAS_HEIGHT / 2);
        return;
    }
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gameObjects.forEach( object => {
        object.update();
        object.draw();
    });

    // Lower the player animation FPS
    if (playerAnimFrameCounter % PLAYER_ANIM_INTERVAL === 0) {
        playerImageIndex = (playerImageIndex + 1) % PLAYER_FRAMES;
    }
    ctx.drawImage(playerImages[playerImageIndex], player.x, player.y, player.width, player.height);
    playerAnimFrameCounter++;

    requestAnimationFrame(animate);

    if (player.y > canvas.height)
    {
        gameOver = true;
    }

    for (let i = 0; i < pipeArray.length; i++)
    {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        ctx.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && player.x > pipe.x + pipe.width)
        {
            score += 0.5;
            pipe.passed = true;
        }

        // Fix collision: use player.y + player.height instead of b.height
        if (detectCollission(player, pipe))
        {
            gameOver = true;
        }
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth)
    {
        pipeArray.shift();
    }

    velocityY += gravity;
    //player.y += velocityY;
    player.y = Math.max(player.y + velocityY, 0);
    document.addEventListener("keydown", moveFigure);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, 5, 45);

    if (gameOver)
    {
        ctx.fillText("Game Over", CANVAS_WIDTH / 2 - 50, CANVAS_HEIGHT / 2);
    }

};

setInterval(placePipes, 1500);

function placePipes() {

    if (gameOver)
    {
        return;
    }
    const gap = 180;
    const groundHeight = 90;
    const minPipeTopY = -pipeHeight + 50;
    const maxPipeTopY = CANVAS_HEIGHT - groundHeight - gap - pipeHeight;

    const topPipeY = Math.random() * (maxPipeTopY - minPipeTopY) + minPipeTopY;

    const topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: topPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };

    const bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: topPipeY + pipeHeight + gap,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };

    pipeArray.push(topPipe);
    pipeArray.push(bottomPipe);
}

function moveFigure(e)
{
    if (
        e.code == "Space" || e.code == "ArrowUp" || e.type === "mousedown")
    {
        velocityY = -6;

        if (gameOver)
        {
            player.y = playerY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            velocityY = 0;
            animate();
        }
    }
}

document.addEventListener("keydown", moveFigure);
canvas.addEventListener("mousedown", moveFigure);

function detectCollission(a, b)
{
    // Fix: use a.y + a.height (not b.height) for bottom of player
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
};


function drawStaticFrame() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gameObjects.forEach(object => {
        object.draw();
    });
    // Only draw player if character selection is not visible
    if (document.getElementById('characterSelection').style.display !== 'block') {
        ctx.drawImage(playerImages[playerImageIndex], player.x, player.y, player.width, player.height);
    }
    pipeArray.forEach(pipe => {
        ctx.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    });
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, 5, 45);
}

const characterFrames = {
    triangle: ['trougao0.png', 'trougao1.png', 'trougao2.png', 'trougao3.png', 'trougao4.png', 'trougao5.png', 'trougao6.png', 'trougao7.png'],
    circle:   ['krug0.png', 'krug1.png', 'krug2.png', 'krug3.png', 'krug4.png', 'krug5.png', 'krug6.png', 'krug7.png', 'krug8.png', 'krug9.png', 'krug10.png'],
    cross:    ['iks0.png', 'iks1.png', 'iks2.png', 'iks3.png', 'iks4.png', 'iks5.png',],
    square:   ['kocka0.png', 'kocka1.png', 'kocka2.png', 'kocka3.png', 'kocka4.png']
};

function showCharacterSelection() {
    document.getElementById('characterSelection').style.display = 'block';
    drawStaticFrame();
}

function selectCharacter(type) {
    playerImages = [];
    for (let i = 0; i < PLAYER_FRAMES; i++) {
        let img = new Image();
        img.src = characterFrames[type][i];
        playerImages.push(img);
    }
    playerImageIndex = 0;
    document.getElementById('characterSelection').style.display = 'none';
    document.getElementById('startOverlay').style.display = 'flex';
    gamePaused = true;
    gameStarted = false;
    drawStaticFrame();
}

document.getElementById('startGameBtn').addEventListener('click', function() {
    document.getElementById('mainMenuOverlay').style.display = 'none';
    showCharacterSelection();
});

document.getElementById('charSelTriangle').onclick = () => selectCharacter('triangle');
document.getElementById('charSelCircle').onclick   = () => selectCharacter('circle');
document.getElementById('charSelCross').onclick    = () => selectCharacter('cross');
document.getElementById('charSelSquare').onclick   = () => selectCharacter('square');

document.getElementById('startBtn').addEventListener('click', function() {
    document.getElementById('startOverlay').style.display = 'none';
    gamePaused = false;
    gameStarted = true;
    animate();
});