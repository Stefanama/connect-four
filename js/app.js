var pieceIsFalling = false
    , color;

function setInitialColor(initialColor) {
    var mainPage = document.getElementById('main-page');
    color = initialColor;
    init();
    mainPage.parentNode.removeChild(mainPage);
}

function init() {
    board.start();
    c4.start();
}
var boardCanvas = document.getElementById('connect-four-board');
var canvas = document.getElementById('connect-four-gameplay');
//overlay board canvas
var board = {
        canvas: boardCanvas
        , start: function () {
            this.ctx = this.canvas.getContext("2d");
            this.canvas.width = 1001;
            this.canvas.height = 928;
            renderBoard();
        }
        , elms: []
    }
    //the game canvas
var c4 = {
        canvas: canvas
        , boardCanvas: boardCanvas
        , start: function () {
            this.ctx = this.canvas.getContext("2d");
            this.canvas.width = 1001;
            this.canvas.height = 928;
            this.interval = setInterval(render, 15);
        }
        , clear: function () {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        , pieces: []
    }
    //Game piece constructor
function GameObject(width, height, image, x, y, type, ctx, color) {
    var that = this;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    //gravity, 0.9 is more accurate but 0.5 looks better
    this.gravity = 0.5;
    this.gravitySpeed = 0;
    //bounce effect, 0=no bounce, 1=bounce all the way up
    this.bounce = 0.4;
    //define the piece's position on the board
    this.boardPosX = (x - 12) / 143;
    this.boardPosY = getBottomFromBoard(this.boardPosX);
    board.elms[this.boardPosX][this.boardPosY][0].occupied = true;
    board.elms[this.boardPosX][this.boardPosY][0].occupiedBy = color;
    //render the given piece image
    this.image = new Image();
    this.image.onload = function () {
        ctx.drawImage(that.image, that.x, that.y, that.width, that.height);
    }
    this.image.src = image;
    //redraw the image in the new position
    this.update = function () {
            ctx.drawImage(that.image, that.x, that.y, that.width, that.height);
        }
        //introduce gravity to the piece
    this.fallDown = function () {
        that.gravitySpeed += that.gravity;
        that.y += 0 + that.gravitySpeed;
        that.hitBottom();
    }
    this.hitBottom = function () {
        var rockbottom = ((this.boardPosY + 1) * 143) - 61;
        //        var rockbottom = c4.canvas.height - this.height - 12;
        if (this.y > rockbottom && this.gravitySpeed > 0.4) {
            this.y = rockbottom;
            this.gravitySpeed = -(this.gravitySpeed * this.bounce);
        }
        else {
            console.log(this.boardPosX, this.boardPosY)
            pieceIsFalling = false;
        }
    }
}
//Board piece constructor
function BoardPiece(width, height, image, x, y, type, ctx) {
    var that = this;
    this.width = width;
    this.height = height;
    this.x = x * 143;
    this.y = (y * 143) + 70;
    //default is not occupied
    this.occupied = false;
    //what color piece is there
    this.occupiedBy = '';
    this.boardPosX = x;
    this.boardPosY = y;
    //render the board piece image
    this.image = new Image();
    this.image.onload = function () {
        ctx.drawImage(that.image, that.x, that.y, that.width, that.height);
    }
    this.image.src = image;
}

function addPiece(color, x, y) {
    return new GameObject(119, 119, 'assets/' + color + '.png', x + 12, y + 12, 'piece', c4.ctx, color);
}

function renderBoard() {
    for (var x = 0; x < 7; x++) {
        board.elms[x] = [];
        for (var y = 0; y < 6; y++) {
            var gameObj = new BoardPiece(143, 143, 'assets/board_piece.png', x, y, 'board', board.ctx);
            board.elms[x][y] = [];
            board.elms[x][y].push(gameObj);
        }
    }
}
// Add event listener for `click` events.
board.canvas.addEventListener('click', function (event) {
    var canvas = board.canvas;
    var x = event.offsetX - canvas.offsetLeft
        , y = event.offsetY - canvas.offsetTop;
    board.elms.forEach(function (column) {
        column.forEach(function (element) {
            if (y > element[0].y && y < element[0].y + element[0].height && x > element[0].x && x < element[0].x + element[0].width) {
                if (pieceIsFalling == false) {
                    var piece = addPiece(color, element[0].x, 0, c4.ctx);
                    c4.pieces[piece.boardPosX] = c4.pieces[piece.boardPosX] || [];
                    c4.pieces[piece.boardPosX].push(piece);
                    if (color == 'red') {
                        color = 'yellow';
                    }
                    else {
                        color = 'red';
                    }
                    pieceIsFalling = true;
                }
            }
        });
    });
}, false);

function render() {
    c4.clear();
    c4.pieces.forEach(function (piece) {
        piece.forEach(function (singlePiece) {
            singlePiece.fallDown();
            singlePiece.update();
        })
    });
}

function getBottomFromBoard(x) {
    var i;
    for (i = 0; i < board.elms[x].length; i++) {
        if (board.elms[x][i][0].occupied) {
            return i - 1;
        }
    }
    return 5;
}
//TODO: implement algo for winning
function checkForWin() {
    var count = 0
        , won = false
        , directions, x = 0
        , y = 0
        , lastColor;
    directions = [
        {
            x: 0
            , y: 1
        }
        , {
            x: 1
            , y: 0
        }
        , {
            x: 1
            , y: 1
        }
        , {
            x: 1
            , y: -1
        }
    ];
    
    //check for each column
    for (var col = 0; col < 3; col++) {
        for (var i = 0; i < 4; i++) {
            if (lastColor == board.elms[col + i][0][0].occupiedBy) {
                lastColor = board.elms[col + i][0][0].occupiedBy;
                count++;
                if (count == 4) {
                    console.log(lastColor + ' won!');
                    return;
                }
            }
        }
    }
}