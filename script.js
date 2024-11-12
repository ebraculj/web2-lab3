// Dobivanje Canvas elementa i konteksta za crtanje
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Funkcija za prilagodbu veličine Canvasa
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Pozivanje funkcije za prilagodbu veličine prilikom učitavanja i promjene veličine prozora
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Konstantne vrijednosti
const PADDLE_WIDTH = 150;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 30;
const BRICK_ROWS = 3;
const BRICK_COLUMNS = 6;
const BRICK_HEIGHT = 40;
const BRICK_PADDING = 10;
const BALL_SPEED = 5;

let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballSpeedX = BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
let ballSpeedY = -BALL_SPEED;
let score = 0;

let maxScore = localStorage.getItem("maxScore") || 0;
// Brisanje starog high score-a


let bricks = [];
let isGameOver = false;
let isGameWon = false;
const brickImage = new Image();
brickImage.src = "cigla.jpg";
// Učitavanje slike platforme
const paddleImage = new Image();
paddleImage.src = "platforma.jpg"; // Slika mora biti u istom direktoriju kao i HTML/JS datoteka
let isLeftPressed = false;
let isRightPressed = false;
const PADDLE_SPEED = 10; // Brzina kretanja platforme
const BRICK_OFFSET_Y = 80; // Povećan razmak od vrha ekrana
// Novi izračun za širinu cigli
const BRICK_WIDTH = (canvas.width - (BRICK_COLUMNS + 1) * BRICK_PADDING) / BRICK_COLUMNS; // Razmak između cigli
const ballImage = new Image();
ballImage.src = "loptica.png";


// Praćenje pritisnutih tipki
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        isLeftPressed = true;
    } else if (e.key === "ArrowRight") {
        isRightPressed = true;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") {
        isLeftPressed = false;
    } else if (e.key === "ArrowRight") {
        isRightPressed = false;
    }
});


// Inicijalizacija cigli
function initBricks() {
    for (let r = 0; r < BRICK_ROWS; r++) {
        bricks[r] = [];
        for (let c = 0; c < BRICK_COLUMNS; c++) {
            bricks[r][c] = { x: 0, y: 0, status: 1 };
        }
    }
}

// Ažurirani izračun za crtanje cigli s razmakom i sjenčenjem
function drawBricks() {
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLUMNS; c++) {
            if (bricks[r][c].status === 1) {
                let brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING; // Razmak između cigli i rubova
                let brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_Y; // Pomicanje cigli prema dolje
                bricks[r][c].x = brickX;
                bricks[r][c].y = brickY;

                // Sjenčanje za cigle
                ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 3;
                ctx.shadowOffsetY = 3;

                // Crtanje slike cigle
                ctx.drawImage(brickImage, brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);

                // Resetiranje sjenčanja nakon crtanja cigle
                ctx.shadowColor = "transparent";
            }
        }
    }
}

// Crtanje platforme s sjenčanjem
function drawPaddle() {
    // Sjenčanje za palicu
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    ctx.drawImage(
        paddleImage,
        paddleX,
        canvas.height - PADDLE_HEIGHT,
        PADDLE_WIDTH,
        PADDLE_HEIGHT
    );

    ctx.shadowColor = "transparent";
}

// Funkcija za crtanje loptice
function drawBall() {
    // Crtanje slike loptice sa većim dimenzijama
    ctx.drawImage(ballImage, ballX - BALL_RADIUS, ballY - BALL_RADIUS, BALL_RADIUS * 2, BALL_RADIUS * 2);
}


// Crtanje rezultata
function drawScore() {
    ctx.font = "20px Arial"; // Definiramo font
    ctx.fillStyle = "#000";  // Crni obrub

    // Crni obrub za "Score"
    ctx.fillText(`Score: ${score}`, canvas.width - 150 + 2, 30 + 2); // Pomaknuto za 2px za obrub

    // Bijeli tekst za "Score"
    ctx.fillStyle = "#fff";  // Bijela boja za tekst
    ctx.fillText(`Score: ${score}`, canvas.width - 150, 30); // Originalna pozicija

    // Crni obrub za "Max Score"
    ctx.fillStyle = "#000";  // Crni obrub
    ctx.fillText(`Max Score: ${maxScore}`, canvas.width - 150 + 2, 60 + 2); // Pomaknuto za 2px za obrub

    // Bijeli tekst za "Max Score"
    ctx.fillStyle = "#fff";  // Bijela boja za tekst
    ctx.fillText(`Max Score: ${maxScore}`, canvas.width - 150, 60); // Originalna pozicija
}

// Detekcija kolizije loptice s ciglama
function collisionDetection() {
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLUMNS; c++) {
            let brick = bricks[r][c];
            if (brick.status === 1) {
                if (ballX > brick.x && ballX < brick.x + BRICK_WIDTH &&
                    ballY > brick.y && ballY < brick.y + BRICK_HEIGHT) {
                    ballSpeedY = -ballSpeedY;
                    // Dodavanje slučajne promjene u brzinu
                    ballSpeedX += Math.random() * 2 - 1;  // Random faktor za X brzinu
                    brick.status = 0;
                    score++;
                    if (score > maxScore) {
                        maxScore = score;
                        localStorage.setItem("maxScore", maxScore);
                    }
                    if (score === BRICK_ROWS * BRICK_COLUMNS) {
                        isGameWon = true;
                    }
                }
            }
        }
    }
}

// Funkcija za crtanje svih elemenata
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawBall();
    drawScore();

    if (isGameOver) {
        ctx.font = "40px Arial";

        // Crni obrub za "GAME OVER"
        ctx.fillStyle = "#000"; // Crni obrub
        ctx.fillText("GAME OVER", canvas.width / 2 - 120 + 2, canvas.height / 2 + 2); // Pomaknuto za 2px za obrub

        // Bijeli tekst za "GAME OVER"
        ctx.fillStyle = "#fff"; // Bijela boja za tekst
        ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);

        return;
    }

    if (isGameWon) {
        ctx.font = "40px Arial";

        // Crni obrub za "YOU WIN!"
        ctx.fillStyle = "#000"; // Crni obrub
        ctx.fillText("YOU WIN!", canvas.width / 2 - 100 + 2, canvas.height / 2 + 2); // Pomaknuto za 2px za obrub

        // Bijeli tekst za "YOU WIN!"
        ctx.fillStyle = "#fff"; // Bijela boja za tekst
        ctx.fillText("YOU WIN!", canvas.width / 2 - 100, canvas.height / 2);

        return;
    }

    // Kretanje loptice
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Kretanje platforme
    if (isLeftPressed && paddleX > 0) {
        paddleX -= PADDLE_SPEED;
    }
    if (isRightPressed && paddleX < canvas.width - PADDLE_WIDTH) {
        paddleX += PADDLE_SPEED;
    }

    // Detekcija sudara loptice s rubovima
    if (ballX + BALL_RADIUS > canvas.width || ballX - BALL_RADIUS < 0) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballY - BALL_RADIUS < 0) {
        ballSpeedY = -ballSpeedY;
    } else if (ballY + BALL_RADIUS > canvas.height) {
        isGameOver = true;
    }

    // Sudar loptice s platformom
    if (ballY + BALL_RADIUS > canvas.height - PADDLE_HEIGHT &&
        ballX > paddleX && ballX < paddleX + PADDLE_WIDTH) {
        ballSpeedY = -ballSpeedY;
    }

    // Detekcija sudara loptice s ciglama
    collisionDetection();
}

// Inicijalizacija igre
initBricks();
setInterval(draw, 16);
