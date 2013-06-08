var holla = require('holla');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require("socket.io").listen(server);

//Express
app.use('/static', express.static(__dirname + '/static'));
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');

app.get('/', function(req,res) {
    res.render('index.html');
});

app.get('/classroom', function(req,res) {
    res.render('classroom.html');
});

app.get('/student', function(req,res) {
    res.render('student.jade');
});

server.listen(3000);
var rtc = holla.createServer(server);

//socket.io
io.sockets.on('connection', function(socket) {
    socket.join('room');

    socket.emit('news', { hello: 'world!'});
    socket.on('my other event', function(data){
        console.log(data);
    });

    socket.on('message-send', function(data){
        io.sockets.in('room').emit('message-update', { msgupdate: data});
    });

});


