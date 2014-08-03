dx = {
  'NORTH': 0,
  'EAST': 1,
  'SOUTH': 0,
  'WEST': -1,
  'NORTH-EAST': 1,
  'SOUTH-EAST': 1,
  'SOUTH-WEST': -1,
  'NORTH-WEST': -1
}
dy = {
  'NORTH': -1,
  'EAST': 0,
  'SOUTH': 1,
  'WEST': 0,
  'NORTH-EAST': -1,
  'SOUTH-EAST': 1,
  'SOUTH-WEST': 1,
  'NORTH-WEST': -1
}
var cardinals = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
var diagonals = ['NORTH-EAST', 'SOUTH-EAST', 'SOUTH-WEST', 'NORTH-WEST'];
var directions = cardinals.concat(diagonals);

function Board(id) {
  var cells = new Array(8);
  for (var row = 0; row < 8; row++) {
    cells[row] = new Array(8);
    for (var col = 0; col < 8; col++) {
       cells[row][col] = new Cell(this, row, col);
    }
  }
  var moves = [];
  this.c = document.getElementById(id);
  this.g = this.c.getContext('2d');
  this.clicked = null;
  this.moveSelected = null;
  this.highlighted = [];

  this.draw = function() {
    var tileSize = this.c.width / 10;
    console.log(this.c.width, tileSize);
    
    // Draw side markings A-H, 1-8
    this.g.fillStyle = '#000000';
    this.g.fillRect(0, 0, this.c.width, this.c.height);
    this.g.fillStyle = '#DDDDDD';
    this.g.font = (tileSize/2) + 'px Arial';
    for (var i = 1; i <= 8; i++) {
      var x;
      var y;
      // Top row A-H
      x = i * tileSize;
      y = tileSize;
      this.g.fillText(String.fromCharCode(64 + i), x, y);

      // Bot row A-H
      x = i * tileSize;
      y = 10 * tileSize;
      this.g.fillText(String.fromCharCode(64 + i), x, y);

      // Left col 8-1
      x = 0;
      y = (i+1) * tileSize;
      this.g.fillText(9 - i, x, y);

      // Right col 8-1
      x = 9 * tileSize;
      y = (i+1) * tileSize;
      this.g.fillText(9 - i, x, y);
    }

    this.g.save();
    this.g.translate(tileSize, tileSize);

    for (var row = 0; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        cells[row][col].draw(this.g, tileSize);
      }
    }

    if (this.clicked !== null) {
      var x = this.clicked.getCol() * tileSize;
      var y = this.clicked.getRow() * tileSize;
      this.g.fillStyle = 'rgba(100, 100, 255, 0.3)';
      this.g.fillRect(x, y, tileSize, tileSize);
    }
    if (this.moveSelected !== null) {
      var x = this.moveSelected.getCol() * tileSize;
      var y = this.moveSelected.getRow() * tileSize;
      this.g.fillStyle = 'rgba(100, 255, 100, 0.5)';
      this.g.fillRect(x, y, tileSize, tileSize);
    }

    for (var i = 0; i < this.highlighted.length; i++) {
      var x = this.highlighted[i].getCol() * tileSize;
      var y = this.highlighted[i].getRow() * tileSize;
      this.g.fillStyle = 'rgba(255, 100, 100, 0.5)';
      this.g.fillRect(x, y, tileSize, tileSize);
    }
    this.g.restore();
  }

  this.click = function(x, y) {
    // 10 because we leave a space for A-H, 1-8 markings
    var tileSize = c.width / 10;

    // Subtract 1 because of the A-H, 1-8 markings
    var col = Math.floor(x / tileSize) - 1;
    var row = Math.floor(y / tileSize) - 1;

    if (!this.withinBounds(new Coord(row, col))) {
      return;
    }

    // Unclicking a previously clicked thing
    if (this.clicked !== null && this.clicked.getCol() === col && this.clicked.getRow() === row) {
      this.highlighted = [];
      this.clicked = null;
      this.moveSelected = null;
    } else {
      // See if selecting move or clicking new cell
      var unhighlight = true;
      for (var i = 0; i < this.highlighted.length; i++) {
        console.log('check', this.highlighted[i], col);
        if (this.highlighted[i].getCol() === col && this.highlighted[i].getRow() === row) {
          unhighlight = false;
          break;
        }
      }

      if (unhighlight) {
        // Clicking new cell
        this.highlighted = [];
        this.clicked = new Coord(row, col);
        this.moveSelected = null;
      } else {
        // Selecting a move
        this.moveSelected = new Coord(row, col);
      }
    }

    cells[row][col].click();
    this.draw();
  }

  this.withinBounds = function(pos) {
    var col = pos.getCol();
    var row = pos.getRow();
    if (col < 0 || col > 7 || row < 0 || row > 7) {
      return false;
    }
    return true;
  }
  this.isValid = function(pos) {
    if (this.withinBounds(pos) && cells[pos.getRow()][pos.getCol()].piece === null) {
      // Empty and valid
      return true;
    } else {
      return false;
    }
  }

  this.possibleMoves = function(start, direction, limit) {
    var pos = start.inDirection(direction);
    var moves = [];

    var steps = 0;
    while (this.isValid(pos)) {
      moves.push(pos);
      pos = pos.inDirection(direction);
      steps++;

      if (limit !== undefined && steps === limit) {
        break;
      }
    }
    if (this.withinBounds(pos)) {
      if (limit === undefined || steps < limit) {
        moves.push(pos);
      }
    }

    return moves;
  }
  this.possibleMovesKnight = function(start) {
    var knightDX = [-1, -2, -2, -1, 1, 2, 2, 1];
    var knightDY = [-2, -1, 1, 2, 2, 1, -1, -2];
    var moves = [];

    for (var i = 0; i < 8; i++) {
      var pos = new Coord(start.getRow() + knightDY[i], start.getCol() + knightDX[i]);
      if (this.withinBounds(pos)) {
        moves.push(pos);
      }
    }

    return moves;
  }

  this.getCell = function(coord) {
    if (this.withinBounds(coord)) {
      return cells[coord.getRow()][coord.getCol()];
    } else {
      return null;
    }
  }

  this.makeMove = function(whiteMove, blackMove) {
    var cellFrom;
    var cellTo;
    var piece;

    // result in the form of 'ACTION WINNER'
    var result = null;

    // if W in B path and B in W path (ie, crossed)
    if (whiteMove.to.inPath(blackMove.path) && blackMove.to.inPath(whiteMove.path)) {
      result = 'FIGHT';
    } else if (whiteMove.to.inPath(blackMove.path)) {
      result = 'INTERCEPT WHITE';
    } else if (blackMove.to.inPath(whiteMove.path)) {
      result = 'INTERCEPT BLACK';
    } else {
      // Noone is in each others path - check if there was a dodge
      if (whiteMove.to.equals(blackMove.from) && blackMove.to.equals(whiteMove.from)) {
        // Double dodge ie they both tried to kill each other
        result = 'FIGHT';
      } else if (whiteMove.to.equals(blackMove.from)) {
        result = 'DODGE BLACK';
      } else if (blackMove.to.equals(whiteMove.from)) {
        result = 'DODGE WHITE';
      } else {
        result = 'NOTHING';
      }
    }

    if (result === null) {
      // Some error
      console.log('No result was found for move made - this should never happen');
    }

    if (result === 'FIGHT') {
      // Process who wins, and what moves where
    } else {
      // Just move the pieces
      var whiteCellFrom = this.getCell(whiteMove.from);
      var blackCellFrom = this.getCell(blackMove.from);
      var whitePiece = whiteCellFrom.piece;
      var blackPiece = blackCellFrom.piece;

      whiteCellFrom.piece = null;
      blackCellFrom.piece = null;

      var cellTo;

      cellTo = this.getCell(whiteMove.to);
      whitePiece.cell = cellTo;
      cellTo.piece = whitePiece;

      cellTo = this.getCell(blackMove.to);
      blackPiece.cell = cellTo;
      cellTo.piece = blackPiece;
    }

    // Add move to moves[]
    var move = '' + whiteMove.from.getCol() + whiteMove.from.getRow() + whiteMove.to.getCol() + whiteMove.to.getRow() +
                    blackMove.from.getCol() + blackMove.from.getRow() + blackMove.to.getCol() + blackMove.to.getRow();
    moves.push(move);

    this.draw();
    return result;
  }

  this.reset = function() {
    var layout = 'CNBQKBNC';
    for (var i = 0; i < 8; i++) {
      cells[0][i].setPiece('BLACK', layout.charAt(i));
      cells[7][i].setPiece('WHITE', layout.charAt(i));

      cells[1][i].setPiece('BLACK', 'P');
      cells[6][i].setPiece('WHITE', 'P');
    }
  }
  this.reset();
  this.draw();
}

function Cell(board, row, col) {
  this.piece = null;
  this.board = board;
  this.col = col;
  this.row = row;
  if ((col % 2 === 0 && row % 2 === 0) || (col % 2 === 1 && row % 2 === 1)) {
    // Both even, so square is white
    this.baseColor = '#ffffff';
  } else {
    this.baseColor = '#cccccc';
  }
  this.clicked = false;

  this.draw = function(g, size) {
    var x = this.col * size;
    var y = this.row * size;

    g.fillStyle = this.baseColor;
    g.fillRect(x, y, size, size);

    if (this.piece !== null) {
      this.piece.draw(g, size);
    }
  }

  this.setPiece = function(player, pieceType) {
    this.piece = new Piece(this, player, pieceType);
  }

  this.click = function(unclickPrevious) {
    console.log('    Clicked cell at', this.col, this.row);

    // Check what we have to highlight
    if (this.piece !== null && this.board.clicked !== null && this.board.moveSelected === null) {
      var pos = new Coord(this.row, this.col);
      if (this.piece.pieceType === 'C') {
        for (var i = 0; i < cardinals.length; i++) {
          var moves = this.board.possibleMoves(pos, cardinals[i]);
          this.board.highlighted = this.board.highlighted.concat(moves);
        }
      } else if (this.piece.pieceType === 'B') {
        for (var i = 0; i < diagonals.length; i++) {
          var moves = this.board.possibleMoves(pos, diagonals[i]);
          this.board.highlighted = this.board.highlighted.concat(moves);
        }
      } else if (this.piece.pieceType === 'N') {
        var moves = this.board.possibleMovesKnight(pos);
        this.board.highlighted = this.board.highlighted.concat(moves);
      } else if (this.piece.pieceType === 'Q') {
        for (var i = 0; i < directions.length; i++) {
          var moves = this.board.possibleMoves(pos, directions[i]);
          this.board.highlighted = this.board.highlighted.concat(moves);
        }
      } else if (this.piece.pieceType === 'K') {
        for (var i = 0; i < directions.length; i++) {
          var moves = this.board.possibleMoves(pos, directions[i], 1);
          this.board.highlighted = this.board.highlighted.concat(moves);
        }
      } else if (this.piece.pieceType === 'P') {
        var jump = 1;
        if (this.row === 1 || this.row === 6) {
          // Starting position
          jump = 2;
        }

        var direction;
        if (this.piece.player === 'BLACK') {
          direction = 'SOUTH';
        } else if (this.piece.player === 'WHITE') {
          direction = 'NORTH';
        } else {
          console.log('Piece is neither black nor white - this should never happen');
        }

        // Moves and initial pos
        var moves = [];

        // Check diagonal killing
        var diagPos;
        diagPos = pos.inDirection('EAST').inDirection(direction);
        if (this.board.withinBounds(diagPos) && !this.board.isValid(diagPos)) {
          moves.push(diagPos);
        }
        diagPos = pos.inDirection('WEST').inDirection(direction);
        if (this.board.withinBounds(diagPos) && !this.board.isValid(diagPos)) {
          moves.push(diagPos);
        }

        // Check forward movement
        for (var i = 0; i < jump; i++) {
          pos = pos.inDirection(direction);
          if (this.board.isValid(pos)) {
            moves.push(pos);
          }
        }
        this.board.highlighted = this.board.highlighted.concat(moves);
      }
    }
  }
}

function Piece(cell, player, pieceType) {
  this.cell = cell;
  this.player = player;
  this.pieceType = pieceType;

  this.draw = function(g, size) {
    if (this.player === 'BLACK') {
      g.fillStyle = '#000000';
    } else if (this.player === 'WHITE') {
      g.fillStyle = '#eeeeee';
    } else {
      console.log('drawing piece with no player', this.player);
    }
    g.font = size + 'px Arial';

    var x = this.cell.col * size;
    var y = this.cell.row * size;
    g.fillText(this.pieceType, x, y + size);
  }
}

function Move(player, from, direction, distance) {
  this.player = player;
  this.from = from;
  this.to = null;
  this.direction = direction;
  this.distance = distance;
  this.path = [];

  var cur = new Coord(from.getRow(), from.getCol());
  for (var i = 0; i < this.distance; i++) {
    cur = cur.inDirection(direction);
    this.path.push(cur);
  }
  this.to = cur;
}

/*
 * Immutable
 */
function Coord(newRow, newCol) {
  var row = newRow;
  var col = newCol;

  this.inDirection = function(direction) {
    var newCoord = new Coord(row + dy[direction], col + dx[direction]);
    return newCoord;
  }

  this.getRow = function() {
    return row;
  }
  this.getCol = function() {
    return col;
  }
  this.equals = function(other) {
    return row === other.getRow() && col === other.getCol();
  }
  this.inPath = function(path) {
    for (var i = 0; i < path.length; i++) {
      if (this.equals(path[i])) {
        return true;
      }
    }
    return false;
  }
}

HTMLCanvasElement.prototype.relMouseCoords = function (event) {
  var totalOffsetX = 0;
  var totalOffsetY = 0;
  var canvasX = 0;
  var canvasY = 0;
  var currentElement = this;

  do {
    totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
    totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
  } while (currentElement = currentElement.offsetParent);

  canvasX = event.pageX - totalOffsetX;
  canvasY = event.pageY - totalOffsetY;

  return {x: canvasX, y: canvasY}
}
