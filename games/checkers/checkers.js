// todo:
// kinging
// enforce mandatory jump (do we really need to tho :)

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const CELL_SIZE = canvas.width / 8;
const PIECE_RADIUS = 18;
const ANIMATE_MOVE_LENGTH = 20;
const ANIMATE_CAPTURE_LENGTH = 20;
const mandatoryJump = true;

// --- initialization methods
const createPieces = () => {

    const pieces = [];

    for(const color of [0, 1]) {
        for(let i = 0; i < 12; i++) {

            // TODO: make this less unreadable
            const y = Math.floor(i / 4) + color * 5;
            pieces.push({
                x: i % 4 * 2 + 1 - y % 2,
                y: y,
                color: color
            });

        }
    }
    
    return pieces;

};

// --- game state
const game = {
    pieces: createPieces(),
    turn: 0,
    selectedPiece: null,
    selectedPieceBefore: null,
    displayedMoves: []
};

// helpers
const findAtPos = (list, x, y) => list.find(elem => elem.x === x && elem.y === y);
const getPiece = (x, y) => findAtPos(game.pieces, x, y);
const getMove = (x, y) => findAtPos(game.displayedMoves, x, y);

// --- move logic
const empty = (x, y) => x >= 0 && y >= 0 && x < 8 && y < 8 && !getPiece(x, y);
const captured = (piece) => game.curMoveCaptured?.includes(piece);

const canMoveTo = (piece, dx, dy) => empty(piece.x + dx, piece.y + dy);
const canJump = (piece, dx, dy) => getPiece(piece.x + dx, piece.y + dy)?.color != piece.color && empty(piece.x + dx * 2, piece.y + dy * 2);

// figure out which pieces have moves
const updatePieces = () => {

    game.jumpAvailable = false;

    for(const piece of game.pieces) {
        
        piece.move = false, piece.jump = false;
        if(piece.color != game.turn) continue;

        const direction = [1, -1][piece.color];
        if(canMoveTo(piece, 1, direction) || canMoveTo(piece, -1, direction) || piece.king && (canJump(piece, 1, -direction) || canJump(piece, -1, -direction))) {
            piece.move = true;
        }

        if(canJump(piece, 1, direction) || canJump(piece, -1, direction) || piece.king && (canJump(piece, 1, -direction) || canJump(piece, -1, -direction))) {
            piece.jump = true;
            game.jumpAvailable = true;
        }

    }

};

// --- drawing parts
const animInterpolate = (start, end, t) => start + (end - start) * t;
const screenCoord = (coord) => coord * CELL_SIZE + CELL_SIZE / 2;

const animateMove = async (piece, finalX, finalY) => new Promise((resolve) => {

    let frame = 0;
    
    const animateFunc = () => {

        const tlinear = frame / ANIMATE_MOVE_LENGTH;
        const t = Math.pow(tlinear - 1, 3) + 1;
        
        drawCheckerboard();
        drawPieces(true);
        drawPiece({
            x: animInterpolate(piece.x, finalX, t),
            y: animInterpolate(piece.y, finalY, t),
            color: piece.color,
            king: piece.king
        });
        
        frame++;
        
        if(frame <= ANIMATE_MOVE_LENGTH) {
            requestAnimationFrame(animateFunc);
        } else {
            resolve();
        }

    };
    
    animateFunc();

});

const drawCheckerboard = () => {
    for(let x = 0; x < 8; x++) {
        for(let y = 0; y < 8; y++) {
            ctx.fillStyle = COLOR_SCHEME.checkerboard[(x % 2) ^ (y % 2)];
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
};

const drawPiece = (piece) => {

    ctx.fillStyle = COLOR_SCHEME.pieces[piece.color];
    ctx.beginPath();
    ctx.arc(
        screenCoord(piece.x),
        screenCoord(piece.y),
        PIECE_RADIUS,
        0, 2 * Math.PI
    )
    ctx.closePath();
    ctx.fill();

    if(piece.king) {
        ctx.fillStyle = COLOR_SCHEME.king;
        ctx.translate(screenCoord(piece.x), screenCoord(piece.y) + 6);
        ctx.beginPath();
        ctx.lineTo(-8, 0);
        ctx.lineTo(-11, -9);
        ctx.lineTo(-4, -5);
        ctx.lineTo(0, -15);
        ctx.lineTo(4, -5);
        ctx.lineTo(11, -9);
        ctx.lineTo(8, 0);
        ctx.closePath();
        ctx.fill();
        ctx.resetTransform();
    }

};

const drawPieces = (animating) => {

    for(const piece of game.pieces) {
    
        // while animating, skip the selected piece (which is drawn separately)
        if(animating && piece == game.selectedPiece) continue;

        if(captured(piece)) {
            ctx.globalAlpha = 0.5;
        }

        drawPiece(piece);
        
        ctx.globalAlpha = 1.0;

        if(piece == game.selectedPiece || (!game.selectedPiece && (game.jumpAvailable ? piece.jump : piece.move))) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#00ff00";
            ctx.beginPath();
            ctx.arc(screenCoord(piece.x), screenCoord(piece.y), PIECE_RADIUS, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();
        }

    }
};

const drawMoves = () => {
    for(const move of game.displayedMoves) {
        ctx.fillStyle = move.capture ? "#ff0000" : "#00ff00";
        ctx.globalAlpha = 0.3;
        ctx.fillRect(move.x * CELL_SIZE, move.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.globalAlpha = 1.0;
    }
};

// --- ui logic
const onSelectPiece = piece => {
    
    // reset moves
    game.curMoveCaptured = [];
    game.curMove = [];

    game.selectedPiece = piece;
    game.displayedMoves = getMoves(piece, true);
    draw();

};

const finishMove = (success) => {

    // clear moves
    game.displayedMoves = [];

    if(success) {

        // change side
        game.turn = 1 - game.turn;
        
        // remove captured pieces
        for(const piece of game.curMoveCaptured) {
            game.pieces.splice(game.pieces.indexOf(piece), 1);
        }

        // check kinging
        if(game.selectedPiece.y == (game.selectedPiece.color == 0 ? 7 : 0)) {
            game.selectedPiece.king = true;
        }

    } else if(game.selectedPieceBefore) {
        game.selectedPiece.x = game.selectedPieceBefore.x;
        game.selectedPiece.y = game.selectedPieceBefore.y;
    }

    // reset everything else
    game.curMoveCaptured = null;
    game.selectedPiece = null;
    game.selectedPieceBefore = null;

};

const onClickMove = async (move) => {

    if(!game.selectedPieceBefore) {
        game.selectedPieceBefore = {
            x: game.selectedPiece.x,
            y: game.selectedPiece.y
        };
    }

    if(move.capture) {
        game.curMoveCaptured.push(move.capture);
    }

    await animateMove(game.selectedPiece, move.x, move.y);
    game.selectedPiece.x = move.x;
    game.selectedPiece.y = move.y;

    if(move.capture) {
        const next = getMoves(game.selectedPiece);
        if(next.length == 0) {
            finishMove(true);
        } else {
            game.displayedMoves = next;
        }
    } else {
        finishMove(true);
    }

    // redraw
    draw();

};

const onClick = event => {

    const x = event.offsetX;
    const y = event.offsetY;

    // check if a piece was clicked
    for(const piece of game.pieces) {
        const dx = x - (piece.x * CELL_SIZE + CELL_SIZE / 2);
        const dy = y - (piece.y * CELL_SIZE + CELL_SIZE / 2);
        if(dx * dx + dy * dy < PIECE_RADIUS * PIECE_RADIUS) {
            if(piece.color == game.turn && game.selectedPiece != piece) {
                onSelectPiece(piece);
                return;
            }
        }
    }

    // check if a move was clicked
    const tileX = Math.floor(x / CELL_SIZE);
    const tileY = Math.floor(y / CELL_SIZE);
    const move = getMove(tileX, tileY);
    if(move) {
        onClickMove(move);
        return;
    }

    finishMove(false);
    draw();

};

const onKeyPress = event => {
    if(event.key === "Escape") {
        if(game.selectedPieceBefore) {
            finishMove(false);
        }
        draw();
    }
};

const draw = () => {
    drawCheckerboard();
    drawPieces();
    drawMoves();
};

// set up event handlers
canvas.addEventListener("click", onClick);
window.addEventListener("keydown", onKeyPress);
updatePieces();
draw();