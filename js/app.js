var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE';

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '🕸';

var gGameIsOn;
var gBoard;
var gGamerPos;
var gBallInterval;
var gScore;
var gBallsOnBoard;
var gGlueInterval;
var gIsGlued;


function initGame() {
    clearInterval(gBallInterval)
    gGameIsOn = true;
    gGamerPos = { i: 2, j: 9 };
    gScore = gBallsOnBoard = 0;
    gIsGlued = false;
    gBoard = buildBoard();
    gBallInterval = setInterval(addElement, 2000, gBoard, BALL);
    gGlueInterval = setInterval(addElement, 5000, gBoard, GLUE);
    renderBoard(gBoard);
    document.querySelector('.score-display span').innerText = gScore;
}


function buildBoard() {
    // Create the Matrix
    var board = createMat(10, 12);



    // Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            // Put FLOOR in a regular cell
            var cell = { type: FLOOR, gameElement: null, portalType: null };
            board[i][j] = cell;

            // Place Walls at edges
            if (!i || i === board.length - 1 || !j || j === board[0].length - 1) cell.type = WALL
            if (i === 5 && (j < 1 || j === board[0].length - 1)) {
                cell.portalType = 'mainAxis'
                cell.type = FLOOR;
            } else if ((i < 1 || i === board.length - 1) && j === 5) {
                cell.portalType = 'secondAxis'
                cell.type = FLOOR;
            }
            // Add created cell to The game board

        }
    }
    // board[5, 5]
    // Place the gamer at selected position
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

    var copyMat = JSON.parse(JSON.stringify(board))
    console.log('copyMat', copyMat)

    return board;
}

// Render the board to an HTML table
function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j });

            // TODO - change to short if statement
            if (currCell.type === FLOOR) cellClass += ' floor';
            else if (currCell.type === WALL) cellClass += ' wall';

            //TODO - Change To template string
            strHTML += '\t<td class="cell ' + cellClass +
                '"  onclick="handleMoveTo(' + i + ',' + j + ')" >\n';

            // TODO - change to switch case statement
            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG;
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG;
            }

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }

    // console.log('strHTML is:');
    // console.log(strHTML);
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function handleMoveTo(i, j, isKeyboard) {
    if (!gGameIsOn || gIsGlued) return

    // if (i < 0) i = gBoard.length - 1
    // if (i > gBoard.length - 1) i = 0
    // if (j < 0) j = gBoard[0].length - 1
    // if (j > gBoard[0].length - 1) j = 0
    // SAME!!!
    i = (i < 0) ? gBoard.length - 1 : (i > gBoard.length - 1) ? 0 : i
    j = (j < 0) ? gBoard[0].length - 1 : (j > gBoard[0].length - 1) ? 0 : j

    // Calculate distance to make sure we are moving to a neighbor cell
    var targetCell = gBoard[i][j];
    if (targetCell.type === WALL) return;
    var currCell = gBoard[gGamerPos.i][gGamerPos.j]
    var iAbsDiff = Math.abs(i - gGamerPos.i);
    var jAbsDiff = Math.abs(j - gGamerPos.j);
    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) ||
        (jAbsDiff === 1 && iAbsDiff === 0)) {
        moveTo(i, j, targetCell);
    } else {
        if (targetCell.portalType !== null && targetCell.portalType === currCell.portalType) moveTo(i, j, targetCell)

        // Alt sol
        // if (!gGamerPos.i && i === gBoard.length - 1 && j === 5) moveTo(gBoard.length - 1, j, targetCell)
        // else if (gGamerPos.i === gBoard.length - 1 && !i && j === 5) moveTo(0, j, targetCell)
        // else if (!gGamerPos.j && i === 5 && j === gBoard[0].length - 1) moveTo(i, gBoard[0].length - 1, targetCell)
        // else if (gGamerPos.j === gBoard[0].length - 1 && i === 5 && j === 0) moveTo(i, 0, targetCell)
    }

}

function moveTo(i, j, targetCell) {
    if (targetCell.gameElement === BALL) {
        gScore++
        gBallsOnBoard--;
        document.querySelector('.score-display span').innerText = gScore;
        if (gBallsOnBoard === 0) showVictorious();
    } else if (targetCell.gameElement === GLUE) {
        setTimeout(function() { gIsGlued = false }, 5000)
        gIsGlued = true;
    }

    // MOVING from current position
    // Model:
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
    // Dom:
    renderCell(gGamerPos, '');

    // MOVING to selected position
    // Model:
    gGamerPos.i = i;
    gGamerPos.j = j;
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
    // DOM:
    renderCell(gGamerPos, GAMER_IMG);
}

// function getPortalMoveCoords(pos, isKeyboard) {
//     if (isKeyboard)
//         switch (pos) {
//             case gGamerPos.i === 0 && pos.i < 0:
//                 break;
//             default:
//                 break;
//         }
// }
// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location);
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}

function addElement(board, element) {
    const emptySpaces = getEmptySpaces(board);
    if (!emptySpaces.length) return;
    const currEmptySpace = emptySpaces[getRandomInt(0, emptySpaces.length - 1)]
    board[currEmptySpace.i][currEmptySpace.j].gameElement = element;
    if (element === BALL) gBallsOnBoard++;
    else if (element === GLUE) setTimeout(removeElement, 3000, gBoard, currEmptySpace)
    renderCell(currEmptySpace, getImgFromElement(element))
}

function removeElement(board, pos) {
    if (board[pos.i][pos.j].gameElement === GAMER) return
    else {
        board[pos.i][pos.j].gameElement = null;
        renderCell(pos, '')
    }

}

function getImgFromElement(element) {
    switch (element) {
        case BALL:
            return BALL_IMG;
        case GLUE:
            return GLUE_IMG;
    }
}

function showVictorious() {
    console.log('win');
    clearInterval(gBallInterval);
    clearInterval(gGlueInterval);
    gGameIsOn = false;
    document.querySelector('restart');
}

// Move the player by keyboard arrows
function handleKey(event) {

    var i = gGamerPos.i;
    var j = gGamerPos.j;


    switch (event.key) {
        case 'ArrowLeft':
            handleMoveTo(i, j - 1, true);
            break;
        case 'ArrowRight':
            handleMoveTo(i, j + 1, true);
            break;
        case 'ArrowUp':
            handleMoveTo(i - 1, j, true);
            break;
        case 'ArrowDown':
            handleMoveTo(i + 1, j, true);
            break;

    }

}

function getEmptySpaces(mat) {
    var emptySpaces = [];
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[0].length; j++) {
            if (!mat[i][j].gameElement && mat[i][j].type !== WALL) emptySpaces.push({ i, j })
        }
    }
    return emptySpaces;
}
// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}