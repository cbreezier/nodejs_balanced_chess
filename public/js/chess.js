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
  this.c = document.getElementById(id);
  this.g = this.c.getContext('2d');
  this.clicked = null;
  this.moveSelected = null;
  this.highlighted = [];

  this.draw = function() {
    var tileSize = this.c.width / 8;
    console.log(this.c.width, tileSize);

    for (var row = 0; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        cells[row][col].draw(this.g, tileSize);
      }
    }

    if (this.clicked !== null) {
      var x = this.clicked.col * tileSize;
      var y = this.clicked.row * tileSize;
      this.g.fillStyle = 'rgba(100, 100, 255, 0.3)';
      this.g.fillRect(x, y, tileSize, tileSize);
    }
    if (this.moveSelected !== null) {
      var x = this.moveSelected.col * tileSize;
      var y = this.moveSelected.row * tileSize;
      this.g.fillStyle = 'rgba(100, 255, 100, 0.5)';
      this.g.fillRect(x, y, tileSize, tileSize);
    }

    for (var i = 0; i < this.highlighted.length; i++) {
      var x = this.highlighted[i].x * tileSize;
      var y = this.highlighted[i].y * tileSize;
      this.g.fillStyle = 'rgba(255, 100, 100, 0.5)';
      this.g.fillRect(x, y, tileSize, tileSize);
    }
  }

  this.click = function(x, y) {
    var tileSize = c.width / 8;
    var col = Math.floor(x / tileSize);
    var row = Math.floor(y / tileSize);

    // Unclicking a previously clicked thing
    if (this.clicked !== null && this.clicked.col === col && this.clicked.row === row) {
      this.highlighted = [];
      this.clicked = null;
      this.moveSelected = null;
    } else {
      // See if selecting move or clicking new cell
      var unhighlight = true;
      for (var i = 0; i < this.highlighted.length; i++) {
        console.log('check', this.highlighted[i], col);
        if (this.highlighted[i].x === col && this.highlighted[i].y === row) {
          unhighlight = false;
          break;
        }
      }

      if (unhighlight) {
        // Clicking new cell
        this.highlighted = [];
        this.clicked = {col: col, row: row};
        this.moveSelected = null;
      } else {
        // Selecting a move
        this.moveSelected = {col: col, row: row};
      }
    }

    cells[row][col].click();
  }

  this.withinBounds = function(pos) {
    if (pos.x < 0 || pos.x > 7 || pos.y < 0 || pos.y > 7) {
      return false;
    }
    return true;
  }
  this.isValid = function(pos) {
    if (this.withinBounds(pos) && cells[pos.y][pos.x].piece === null) {
      // Empty and valid
      return true;
    } else {
      return false;
    }
  }

  this.possibleMoves = function(start, direction, limit) {
    var pos = {x: start.x + dx[direction], y: start.y + dy[direction]};
    var moves = [];

    var steps = 0;
    while (this.isValid(pos)) {
      moves.push(pos);
      pos = {x: pos.x + dx[direction], y: pos.y + dy[direction]};
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
      var pos = {x: start.x + knightDX[i], y: start.y + knightDY[i]};
      if (this.withinBounds(pos)) {
        moves.push(pos);
      }
    }

    return moves;
  }

  this.reset = function() {
    var layout = 'CNBKQBNC';
    for (var i = 0; i < 8; i++) {
      cells[0][i].setPiece('BLACK', layout.charAt(i));
      cells[7][i].setPiece('WHITE', layout.charAt(i));

      cells[1][i].setPiece('BLACK', 'P');
      cells[6][i].setPiece('WHITE', 'P');
    }
  }
  this.reset();
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
      if (this.piece.pieceType === 'C') {
        for (var i = 0; i < cardinals.length; i++) {
          var moves = this.board.possibleMoves({x: this.col, y: this.row}, cardinals[i]);
          this.board.highlighted = this.board.highlighted.concat(moves);
        }
      } else if (this.piece.pieceType === 'B') {
        for (var i = 0; i < diagonals.length; i++) {
          var moves = this.board.possibleMoves({x: this.col, y: this.row}, diagonals[i]);
          this.board.highlighted = this.board.highlighted.concat(moves);
        }
      } else if (this.piece.pieceType === 'N') {
        var moves = this.board.possibleMovesKnight({x: this.col, y: this.row});
        this.board.highlighted = this.board.highlighted.concat(moves);
      } else if (this.piece.pieceType === 'Q') {
        for (var i = 0; i < directions.length; i++) {
          var moves = this.board.possibleMoves({x: this.col, y: this.row}, directions[i]);
          this.board.highlighted = this.board.highlighted.concat(moves);
        }
      } else if (this.piece.pieceType === 'K') {
        for (var i = 0; i < directions.length; i++) {
          var moves = this.board.possibleMoves({x: this.col, y: this.row}, directions[i], 1);
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
        pos = {x: this.col, y: this.row};

        console.log('before diag');
        // Check diagonal killing
        var diagPos;
        diagPos = {x: pos.x + 1, y: pos.y + dy[direction]};
        if (this.board.withinBounds(diagPos) && !this.board.isValid(diagPos)) {
          moves.push(diagPos);
        }
        diagPos = {x: pos.x - 1, y: pos.y + dy[direction]};
        if (this.board.withinBounds(diagPos) && !this.board.isValid(diagPos)) {
          moves.push(diagPos);
        }

        // Check forward movement
        for (var i = 0; i < jump; i++) {
          pos = {x: pos.x, y: pos.y + dy[direction]};
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
