var util = require('util');
var express = require('express');
var app = express();
var server = app.listen(8888);
var io = require('socket.io').listen(server);
var mongo = require('mongodb');

var mongoServer = new mongo.Server('ds033669.mongolab.com', 33669, {auto_reconnect: true, safe: false});
var db = new mongo.Db('balanced_chess', mongoServer);
var mongoTest;
var mongoUsers;
db.open(function(err, client) {
  client.authenticate('app', 'password', function(err, success) {
    console.log('Successfully authen mongo');
    mongoTest = db.collection('test');
    mongoTest.remove();
    mongoTest.insert({game_id: 1, player_black: "Random", player_white: "Bob", spectators: 12});
    mongoTest.insert({game_id: 2, player_black: "test", player_white: "hi", spectators: 1});

    mongoUsers = db.collection('users');
    mongoUsers.remove();
    mongoUsers.insert({user: 'Test', pass: 'abc123', other: 'other information'});
  });
});

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser('1qaz@WSX'));
  app.use(express.session());
  // app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.favicon()); // TODO specify favicon
  app.use(express.logger());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {
  console.log('Session =', req.sessionID);
  mongoUsers.findOne({sessionID: req.sessionID}, function(err, doc) {
    if (err) throw err;

    if (doc === null) {
      res.render('index', {pageTitle: 'Some Title', user: undefined});
    } else {
      console.log('search sessio id', doc);
      res.render('index', {pageTitle: 'Some Title', user: doc.user});
    }
  });
});
app.get('/game/:game_id', function(req, res) {
  res.render('game', {pageTitle: 'Game', gameID: req.params.game_id});
});
app.post('/login', function(req, res) {
  var user = req.body.user;
  var pass = req.body.pass;
  
  mongoUsers.findOne({user: user}, function(err, doc) {
    if (err) throw err;

    if (doc === null) {
      res.send('fail');
      return;
    }
    
    var requiredPass = doc.pass;
    console.log('required pass is', requiredPass, pass);

    if (pass === requiredPass) {
      mongoUsers.update({user: user}, {$set: {sessionID: req.sessionID}});
      req.session.user = user;
      res.send('success');
    } else {
      res.send('fail');
    }
  });
});

io.sockets.on('connection', function (socket) {
  console.log("debug: connection established with", socket.id);
  // Send initial game data to new connecting client
  sendGameList(socket);

  // When receiving a message on lobby-chat, emit to all clients
  socket.on('lobby-chat', function (data) {
    io.sockets.emit('lobby-chat', {message: data.message});
  });
});

function sendGameList(socket) {
  if (mongoTest !== undefined) {
    var games = mongoTest.find({});
    var gameList = [];
    games.each(function (err, doc) {
      if (doc == null) {
        socket.emit('new-game-list', {message: gameList});
      } else {
        gameList.push(doc);
      }
    });
  }
}