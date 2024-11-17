//dodavanje canvas elementa
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

//prilagodba velicine canvasa
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

//poziv funkcije za prilagodbu velicine pri ucitavanju i mijenjanju velicine prozora
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

//konstante
//visina i sirina platforme
const PADDLE_WIDTH = 150;
const PADDLE_HEIGHT = 20;
//radijus loptice
const BALL_RADIUS = 30;
//broj redaka i stupaca cigli
const BRICK_ROWS = 3;
const BRICK_COLUMNS = 6;
//visina i razmak svake od cigli
const BRICK_HEIGHT = 40;
const BRICK_PADDING = 10;
//brzina loptice
const BALL_SPEED = 5;

//postavljanje platforme na sredinu na pocetku igre
let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
//postavljanje loptice na sredinu canvasa na platformu
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
//generira se sluc kut izmedu 30 i 150 stupnjeva kako bi se sprijecilo 0/180 odbijanje
let angle = Math.random() * (150 - 30) + 30;
let rad = (angle * Math.PI) / 180; //pretvorba u radijane

//incijalizacija brzine po kutu
let ballSpeedX = BALL_SPEED * Math.cos(rad);
let ballSpeedY = -BALL_SPEED * Math.sin(rad);

//trenutni score 0 na pocetku svake igre
let score = 0;

//dohvacanje max score iz local storage
let maxScore = localStorage.getItem("maxScore") || 0;

//pocetne postavke igre
let bricks = [];
let isGameOver = false;
let isGameWon = false;
//postavljanje slike cigle izvor: https://life-decor.com/products/zidne-obloge-glatka-cigla-wa002
const brickImage = new Image();
brickImage.src = "cigla.jpg";
// postavljanje slike platforme izvor: https://metal-kovis.hr/webshop/price/12049/platforma-za-dizanje-tereta-4000-kg
const paddleImage = new Image();
paddleImage.src = "platforma.jpg";
//postavljanje slike loptice izvor: samostalno nacrtana
const ballImage = new Image();
ballImage.src = "loptica.png";
//varijable za pracenje tipki
let isLeftPressed = false;
let isRightPressed = false;

const PADDLE_SPEED = 10; //brzina kretanja platforme
const BRICK_OFFSET_Y = 80; //spustanje cigli od vrha ekrana da se vidi max score i score
//sirina cigli obzirom na razmak i velicinu canvasa
const BRICK_WIDTH = (canvas.width - (BRICK_COLUMNS + 1) * BRICK_PADDING) / BRICK_COLUMNS;

//pracenje pritisnutih tipki
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


//incijalizacija cigli
function initBricks() {
    for (let r = 0; r < BRICK_ROWS; r++) {
        bricks[r] = [];
        for (let c = 0; c < BRICK_COLUMNS; c++) {
            bricks[r][c] = { x: 0, y: 0, status: 1 }; //postavljanje jedinice znaci da cigla jos nije unistena
        }
    }
}

//funkcija za crtanje cigli
function drawBricks() {
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLUMNS; c++) {
            if (bricks[r][c].status === 1) {
                //racunanje pozicije cigle
                let brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING; //smjestanje cigli horizontalno u redove
                let brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_Y; //smjestanje cigli vrertikalno u stupce
                bricks[r][c].x = brickX;
                bricks[r][c].y = brickY;

                //postavljanje sjencanja
                ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 3;
                ctx.shadowOffsetY = 3;

                //crtanje cigle slikom i postavljanje poziije i dimenzija
                ctx.drawImage(brickImage, brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                ctx.shadowColor = "transparent";
            }
        }
    }
}

//crtanje platforme
function drawPaddle() {
    //sjencanje
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    //postavljanje slike pozicije i dimenzija platforme
    ctx.drawImage(paddleImage, paddleX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowColor = "transparent";
}

//crtanje loptice
function drawBall() {
    ctx.drawImage(ballImage, ballX - BALL_RADIUS, ballY - BALL_RADIUS, BALL_RADIUS * 2, BALL_RADIUS * 2);
}

// Crtanje rezultata
function drawScore() {
    //postavljanje fonta i boje teksta
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000000";

    ctx.fillText(`Score: ${score}`, canvas.width - 150, 30);
    ctx.fillText(`Max Score: ${maxScore}`, canvas.width - 150, 60);
}


//funkcija za detekciju sudara
function collisionDetection() {
    //dohvacanje trenutne cigle
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLUMNS; c++) {
            let brick = bricks[r][c];
            if (brick.status === 1) { //ako jos nije unistena
                //ako je loptica unutar granica te cigle
                if (ballX > brick.x && ballX < brick.x + BRICK_WIDTH &&
                    ballY > brick.y && ballY < brick.y + BRICK_HEIGHT) {
                    //odbijanje loptice
                    ballSpeedY = -ballSpeedY;
                    ballSpeedX += Math.random() * 2 - 1;  // Random faktor za X brzinu
                    //uklanjamo tu ciglu i povecavamo score
                    brick.status = 0;
                    score++;
                    //provjera je li nadmasen dosadasnji max
                    if (score > maxScore) {
                        //ako da pohrana novog max scorea
                        maxScore = score;
                        localStorage.setItem("maxScore", maxScore);
                    }
                    //ako je score jednak pocetnom broju cigli
                    if (score === BRICK_ROWS * BRICK_COLUMNS) {
                        isGameWon = true; //pobjeda
                    }
                }
            }
        }
    }
}

//funckcija za ctranje svih elemenata
function draw() {
    //brisanje cijelog canvasa
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //dodavanje elemenata igre
    drawBricks();
    drawPaddle();
    drawBall();
    drawScore();

    if (isGameOver){
        //postavljanje fonta i boje teksta
        ctx.font = "40px Arial";
        ctx.fillStyle = "#000000";
        //ako je igra izgubljena prikazuje se GAME OVER
        ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
        return;
    }
    

    if (isGameWon) {
        //postavljanje fonta i boje teksta
        ctx.font = "40px Arial";
        ctx.fillStyle = "#000000";
        //ako je doslo do pobjede prikazuje se YOU WIN  
        ctx.fillText("YOU WIN!", canvas.width / 2 - 100, canvas.height / 2);
        return;
    }
    

    //azuriranje pozicije loptice
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    //pomicanje platforme lijevo/desno
    if (isLeftPressed && paddleX > 0) {
        paddleX -= PADDLE_SPEED;
    }
    if (isRightPressed && paddleX < canvas.width - PADDLE_WIDTH) {
        paddleX += PADDLE_SPEED;
    }

    //ako se loptica sudari s rubon canvasa mijenja se smjer kretanja(odbijanje)
    if (ballX + BALL_RADIUS > canvas.width || ballX - BALL_RADIUS < 0) { //bocni rubovi
        ballSpeedX = -ballSpeedX;
    }
    if (ballY - BALL_RADIUS < 0) { //gornji rub
        ballSpeedY = -ballSpeedY;

    } else if (ballY + BALL_RADIUS > canvas.height) { //"odbijanje" o donji rub rezultira s GAME OVER
        isGameOver = true;
    }

    //provjera je li loptica u visini platforme i unutar sirine platforme
    if (ballY + BALL_RADIUS > canvas.height - PADDLE_HEIGHT && ballX > paddleX && ballX < paddleX + PADDLE_WIDTH) {
        let hitPosition = (ballX - paddleX - PADDLE_WIDTH / 2) / (PADDLE_WIDTH / 2); //racuna poziciju na kojoj se dogodio sudar platforme i loptice(kako bi omogucili da se loptica vecinom odbije u suprotnom X smjeru)    
        //postavlja se novi kut odbijanja na toj poziciji
        let angle = hitPosition * (Math.PI / 3); //kut do 60 stupnjeva
        //azurirnje brzine loptice po kutu
        ballSpeedX = BALL_SPEED * Math.sin(angle);
        ballSpeedY = -BALL_SPEED * Math.cos(angle);
    }
    
    //poziv funkcije za otkiravnje sudara
    collisionDetection();
}

//inicijalizacija igre
initBricks();
setInterval(draw, 16);
