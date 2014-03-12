var express = require('express');
var app = express();
var server = app.listen(8888);
var io = require('socket.io').listen(server);

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon()); // TODO specify favicon
  app.use(express.logger());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {
  res.render('index');
});