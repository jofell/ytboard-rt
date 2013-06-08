var holla = require('holla');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require("socket.io").listen(server);
var im = require("imagemagick");
var mkpath = require("mkpath");

//Express
app.use('/static', express.static(__dirname + '/static'));
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');

app.use(express.bodyParser({ keepExtensions: true, uploadDir: "uploads" }));


app.get('/', function(req,res) {
  res.render('index.html');
});

app.get('/classroom', function(req,res) {
  res.render('classroom.html');
});

app.get('/whiteboard', function(req,res) {
  res.render('whiteboard.html');
});

app.get('/slyduck', function(req, res){
  res.render('slyduck.html');
});

app.post('/grab', function (req, res) {
  // connect-form adds the req.form object
  // we can (optionally) define onComplete, passing
  // the exception (if any) fields parsed, and files parsed
  im.identify(['-format', '%n', req.files.file.path], function(err, pages){
    if (err) throw err;

    var iter = 0;
    var currTime = new Date().getTime() + '';
    var outFolder = __dirname + '/static/images/slides/' + currTime;

    mkpath( outFolder, function (err) {
      if (err) throw err;
      console.log('Directory structure red/green/violet created');
    });

    var seriesConvert = function(iteration) {

      im.convert(['-density', 288, req.files.file.path +'[' + iteration + ']',
                  '-resize', '25%', outFolder + '/slide-' + iteration + '.jpg'],
       function(err, stdout){
         if (err) throw err;
         if (iter == 0) res.end(JSON.stringify({ 
           slide_id: currTime, 
           pages: parseInt(pages),
           index: 0})
         );
         iter++;
         if (iter < pages) seriesConvert(iter);
       });
    }

    seriesConvert(iter);
  });
});

server.listen(3000);
var rtc = holla.createServer(server);

//socket.io
io.sockets.on('connection', function(socket) {
    socket.join('room');


    socket.on('drawClick', function(data) {
      console.log(data);
      io.sockets.in('room').emit('draw', { x: data.x, y: data.y, type: data.type});
    });

    socket.emit('news', { hello: 'world!'});
    socket.on('my other event', function(data){
        console.log(data);
    });

    socket.on('message-send', function(data){
        io.sockets.in('room').emit('message-update', { msgupdate: data});
    });

});


