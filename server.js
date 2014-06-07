var util = require('util');
var express = require('express');
var app = express();
var server = app.listen(8888);
var io = require('socket.io').listen(server);
var mongo = require('mongodb');

var mongoServer = new mongo.Server('ds033669.mongolab.com', 33669, {auto_reconnect: true, safe: false});
var db = new mongo.Db('balanced_chess', mongoServer);
var mongoTest;
db.open(function(err, client) {
  client.authenticate('app', 'password', function(err, success) {
    console.log('Successfully authen mongo');
    mongoTest = db.collection('test');
    mongoTest.remove();
    mongoTest.insert({game_id: 1, player_black: "Random", player_white: "Bob", spectators: 12});
    mongoTest.insert({game_id: 2, player_black: "test", player_white: "hi", spectators: 1});

    var games = mongoTest.find({});
    sendGameList();
  });
});

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon()); // TODO specify favicon
  app.use(express.logger());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {
  res.render('index', {pageTitle: 'Some Title'});
});
app.get('/game', function(req, res) {
  res.render('game', {pageTitle: 'Game', gameID: req.query.id});
});

io.sockets.on('connection', function (socket) {
  console.log("debug: connection established with", socket.id);
  // Send initial game data to new connecting client
  sendGameList();

  // When receiving a message on lobby-chat, emit to all clients
  socket.on('lobby-chat', function (data) {
    console.log(data.message);
    io.sockets.emit('lobby-chat', {message: data.message});
    // mongoTest.insert({test: 'test'});
  });
});

function sendGameList() {
  if (mongoTest !== undefined) {
    var games = mongoTest.find({});
    var gameList = [];
    games.each(function (err, doc) {
      if (doc == null) {
        console.log("Game list is:", gameList);
        io.sockets.emit('new-game-list', {message: gameList});
      } else {
        console.log(doc);
        gameList.push(doc);
      }
    });
  }
}