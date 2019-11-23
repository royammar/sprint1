'use strict'

var gLevel = {}
var gGame = {}
var gBoard = []
var MINE = '💣'
var gIsfirstclick = true
var gNumOfMines = 2
var FLAG = '🚩'
var SIZE = 4
var NORMAL = '😊'
var DEAD = '💀'
var WIN = '😎'
var EXPLOSION = '💥'
var gTimeInterval = null;
var gElTimer = 0
var gstartTime = 0
var gTimeCounter = 0
var gIsHint = false
var ghintsLeft = 2
var gShownCells = []
var gLivesLeft = 3
var gSafeclicksLeft = 2
localStorage.Begginer=999
localStorage.Medium=999
localStorage.Expert=999
var isManual=false
gLevel = [{ SIZE: 4, MINES: 2, bestTime: Infinity }, { SIZE: 8, MINES: 12, bestTime: Infinity }, { SIZE: 12, MINES: 30, bestTime: Infinity }]

var gBoard = buildBoard(gLevel[0].SIZE)
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}



function ChangeBoard(value) {

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    };
    gIsfirstclick = true
    var updateSize = gLevel[value].SIZE
    gBoard = buildBoard(updateSize)
    gNumOfMines = gLevel[value].MINES
    var elHint = document.querySelector('.hint')
    elHint.innerText = ('💡💡💡')
    var elLives = document.querySelector('.lives')
    elLives.innerText = 'Lives : 😊😊😊'
    var elBtn = document.querySelector('.game-over button')
    var elHint = document.querySelector('.Safe')
    elHint.innerText = ('🦺🦺🦺')


    elBtn.innerText = NORMAL
    init()
}





function init() {
    showHighScore()
    gLivesLeft = 3
    gIsHint = false
    gGame.isOn = true
    clearInterval(gTimeInterval);
    gTimeInterval = null
    gElTimer = document.querySelector('.timer')
    gElTimer.innerText = ''
    gShownCells = []
    ghintsLeft = 2
    gSafeclicksLeft = 2
    renderBoard()


}

function buildBoard(gBoardSize) {

    var board = [];

    for (var i = 0; i < gBoardSize; i++) {
        board[i] = [];
        for (var j = 0; j < gBoardSize; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isExpanded: false,
                isExploded: false
            }

            board[i][j] = cell;
        }
    }

    return board;

}

function renderBoard() {
    var strHTML = '';
    for (var i = 0; i < gBoard.length; i++) {
        var cellContent = ''
        strHTML += '<tr>\n'
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j];

            if (cell.isShown) {
                cellContent = (cell.isMine) ? MINE : cell.minesAroundCount;
            }
            if (cell.isMarked) cellContent = FLAG
            if (cell.isExploded) cellContent = EXPLOSION
            strHTML += `\t<td   
            data-i=${i}  data-j=${j} 
             oncontextmenu="cellMarked( ${i}, ${j},event)" onclick="cellClicked(this, ${i}, ${j},event)"  > ${cellContent}</td>\n`
            cellContent = ''
        }

        strHTML += '</tr>\n'

    }
    var elboard = document.querySelector('.board-container');
    elboard.innerHTML = strHTML;

}



function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {

            for (var index = i - 1; index <= i + 1; index++) {
                if (index < 0 || index >= gBoard.length) continue;
                for (var jIndex = j - 1; jIndex <= j + 1; jIndex++) {
                    if (jIndex < 0 || jIndex >= gBoard.length) continue;
                    if (index === i && jIndex === j) continue;
                    if (gBoard[index][jIndex].isMine)
                        gBoard[i][j].minesAroundCount++
                }
            }
        }
    }
}


function cellClicked(elCell, i, j, event) {
    // if (isManual) {
    //     placeMines(i,j)
    // return
    // }
    if (gIsHint) {
        revealHint(i, j)
        return
    }
    if (!gGame.isOn || gBoard[i][j].isMarked || gBoard[i][j].isExploded) return
    var cell = gBoard[i][j];
    if (gIsfirstclick) {
        gIsfirstclick = false
        gstartTime = Date.now()
        timer()
        placeMines(gNumOfMines, i, j)
        setMinesNegsCount()
        if (cell.minesAroundCount > 0) {
            cell.isShown = true
            gGame.shownCount++
        }
        if (cell.minesAroundCount === 0) expandShown(i, j)
        renderBoard()
    }

    if (!cell.isShown) {
        if (!cell.isMine) {
            if (cell.minesAroundCount === 0) expandShown(i, j)
            if (cell.minesAroundCount > 0) {
                cell.isShown = true
                gGame.shownCount++
            }
            renderBoard()
            checkGameOver()

        }
        else {
            gLivesLeft--

            if (gLivesLeft === 0) {
                gGame.isOn = false
                var elLives = document.querySelector('.lives')
                elLives.innerText = ''
                showAllMines()
                gameOver()
            }
            else {

                gBoard[i][j].isExploded = true
                gBoard[i][j].isExploded = true

                var strHTML = 'Lives:'
                for (var i = 0; i < gLivesLeft; i++) {
                    strHTML += '😊'
                }
                var elLives = document.querySelector('.lives')
                elLives.innerText = strHTML

                renderBoard()
                checkGameOver()

            }



        }
    }


}


function placeMines(numOfMines, posI, posJ) {

    var emptyCells = []
    var rndCell = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isMine && i !== posI && j !== posJ) emptyCells.push({ i: i, j: j })
        }
    }
    emptyCells.sort(function (a, b) { return 0.5 - Math.random() });
    for (var i = 0; i < numOfMines; i++) {
        rndCell = emptyCells.pop()
        gBoard[rndCell.i][rndCell.j].isMine = true

    }

}



function showAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isMarked = false
                gBoard[i][j].isShown = true
            }
        }
    }
    renderBoard()
}



function cellMarked(i, j, event) {
    if (!gGame.isOn) return
    var cell = gBoard[i][j]
    if (cell.isShown && cell.isMarked)  {
        cell.isMarked=false
        cell.isShown=false
    }
    if (cell.isShown)return
    cell.isMarked = (cell.isMarked) ? false : true;
    renderBoard();
    (cell.isMarked) ? gGame.markedCount++ : gGame.markedCount--;
    checkGameOver()

}


function expandShown(posI, posJ) {
    gGame.shownCount++
    gBoard[posI][posJ].isShown = true
    if (posI > gBoard.length || posJ > gBoard.length || posI < 0 || posJ < 0) return

    if (gBoard[posI][posJ].minesAroundCount === 0 && !gBoard[posI][posJ].isExpanded && !gBoard[posI][posJ].isMine) {

        for (var i = posI - 1; i <= posI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = posJ - 1; j <= posJ + 1; j++) {
                if (j < 0 || j >= gBoard.length) continue;
                if (i === posI && j === posJ) continue
                if (!gBoard[i][j].isMine) {

                    gBoard[i][j].isShown = true

                    gBoard[posI][posJ].isExpanded = true

                    if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isExpanded) {
                        expandShown(i, j)
                        gGame.shownCount++
                    }
                }

            }
        }
    }
    else {
        return

    }

}
function checkGameOver() {

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {

            if (gBoard[i][j].isMine) {
                if (!gBoard[i][j].isMarked) {
                    if (!gBoard[i][j].isExploded) return false
                }
            }
            else {
                if (!gBoard[i][j].isShown) return false
            }
        }
    }
    gGame.isOn = false
    gameWin()


}




function restart() {

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    };
    gIsfirstclick = true
    gNumOfMines = 2
    SIZE = 4
    var elRadiobtn = document.getElementById("default");
    elRadiobtn.checked = true
    var elBtn = document.querySelector('.game-over button')
    elBtn.innerText = NORMAL
    gBoard = buildBoard(gLevel[0].SIZE)
    var elHint = document.querySelector('.hint')
    elHint.innerText = ('💡💡💡')
    var elLives = document.querySelector('.lives')
    elLives.innerText = 'Lives : 😊😊😊'
    var elHint = document.querySelector('.Safe')
    elHint.innerText = ('🦺🦺🦺')

    init()

}

function gameWin() {
    stopTimer()
    cehckBestScroe()
    var elBtn = document.querySelector('.game-over button')
    elBtn.innerText = WIN
}

function gameOver() {

    var elBtn = document.querySelector('.game-over button')
    elBtn.innerText = DEAD
    stopTimer()
}

function runTimer() {
    gTimeCounter = (Date.now() - gstartTime) / 1000
    gElTimer = document.querySelector('.timer')
    gElTimer.innerText = `Time: ${gTimeCounter}`
}

function timer() {
    gTimeInterval = setInterval(runTimer, 100)
}


function stopTimer() {
    clearInterval(gTimeInterval);
    gTimeInterval = null;

}


function activatHint() {
    if (gIsfirstclick || !gGame.isOn) return
    else gIsHint = true
    if (ghintsLeft === 2) {
        ghintsLeft--
        var elHint = document.querySelector('.hint')
        elHint.innerText = ('💡   💡')
    }
    else if (ghintsLeft === 1) {
        ghintsLeft--
        var elHint = document.querySelector('.hint')
        elHint.innerText = ('   💡   ')
    }
    else if (ghintsLeft === 0) {
        ghintsLeft--
        var elHint = document.querySelector('.hint')
        elHint.innerText = ('No hints left 😞')
    }
    else {
        gIsHint = false
    }
}

function revealHint(posI, posJ) {
    var showencells = []
    showencells = findShownCells(posI, posJ)

    for (var index = 0; index < showencells.length; index++) {

        gBoard[showencells[index].i][showencells[index].j].isShown = true

    }
    renderBoard()
    setTimeout(function () { hideHint(showencells) }, 1000)
}


function hideHint(showencells) {
    for (var index = 0; index < showencells.length; index++) {

        gBoard[showencells[index].i][showencells[index].j].isShown = false
    }
    renderBoard()
    gIsHint = false
}




function findShownCells(posI, posJ) {
    gShownCells = []
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;

            if (!gBoard[i][j].isShown) gShownCells.push({ i, j })

        }
    }
    return gShownCells
}


function cehckBestScroe() {
    
    switch (gBoard.length) {
        case gLevel[0].SIZE:
            if (gTimeCounter < localStorage.Begginer)
                localStorage.Begginer = gTimeCounter
            var elBestScore = document.getElementById(gBoard.length)
            elBestScore.innerText = "Begginer:" + localStorage.Begginer
            break
        case gLevel[1].SIZE:
            if (gTimeCounter < localStorage.Medium)
                ocalStorage.Medium = gTimeCounterl
            var elBestScore = document.getElementById(gBoard.length)
            elBestScore.innerText = "Medium:" + localStorage.Medium
            break;
        case gLevel[2].SIZE:
            if (gTimeCounter < localStorage.Expert)
                localStorage.Expert = gTimeCounter
            var elBestScore = document.getElementById(gBoard.length)
            elBestScore.innerText = "Expert:" + localStorage.Expert
            break;
    }

    console.log(localStorage.bestTime);
}


function showHighScore() {
    var elBestScore = document.getElementById(4)
    elBestScore.innerText = "Begginer:" + localStorage.Begginer
    elBestScore = document.getElementById(8)
    elBestScore.innerText = "Medium:" + localStorage.Medium
    elBestScore = document.getElementById(12)
    elBestScore.innerText = "Expert:" + localStorage.Expert
}


function safeClick() {
    var ShownCells = []
    var safeCell = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {

            if (!gBoard[i][j].isShown && !gBoard[i][j].isMine && !gBoard[i][j].isExploded) ShownCells.push({ i, j })

        }
    }

    ShownCells.sort(function (a, b) { return 0.5 - Math.random() });
    safeCell = ShownCells.pop()
    showSafecell(safeCell)

}


function showSafecell(safeCell) {


    var a = document.querySelector('.board-container').rows[safeCell.i].cells[safeCell.j]
    a.classList.add("mark");

    setTimeout(function () { a.classList.remove("mark"); }, 1000)

}

function SafeCells() {

    if (gSafeclicksLeft === 2) {
        safeClick()
        gSafeclicksLeft--
        var elHint = document.querySelector('.Safe')
        elHint.innerText = ('🦺   🦺')
    }
    else if (gSafeclicksLeft === 1) {
        safeClick()
        gSafeclicksLeft--
        var elHint = document.querySelector('.Safe')
        elHint.innerText = ('   🦺   ')
    }
    else if (gSafeclicksLeft === 0) {
        safeClick()
        gSafeclicksLeft--
        var elHint = document.querySelector('.Safe')
        elHint.innerText = ('No safe clicks left 😞')
    }
}       


// function manual() {
//      isManual=true
// }


// function placeMines(i,j) {
   
//     if( gBoard[i][j].isMine===true){
//     gBoard[i][j].isMine=false
//     gBoard[i][j].isShown=false
//     }
//     else {
//         gBoard[i][j].isMine=true
//         gBoard[i][j].isShown=true

//     }
// renderBoard()
// }




