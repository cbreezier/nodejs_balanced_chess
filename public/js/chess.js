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
  }

  this.click = function(x, y) {
    console.log('Clicked coordinate', x, y);

    var tileSize = c.width / 8;
    var col = Math.floor(x / tileSize);
    var row = Math.floor(y / tileSize);
    cells[row][col].click();
  }
}

function Cell(board, row, col) {
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
  }

  this.click = function() {
    console.log('    Clicked cell at', this.col, this.row);
    this.board.clicked = this.board.clicked == this ? null : this;
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
