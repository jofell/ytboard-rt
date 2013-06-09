
  var App;

  App = {};

  App.init = function() {
    App.canvas = document.createElement('canvas');
    App.canvas.height = 400;
    App.canvas.width = 800;
    document.getElementsByTagName('article')[0].appendChild(App.canvas);
    App.ctx = App.canvas.getContext("2d");
    App.ctx.fillStyle = "#solid";
    App.ctx.strokeStyle = "#000";
    App.ctx.lineWidth = 5;
    App.ctx.lineCap = "round";
    App.socket = io.connect('http://192.168.1.100:3000/');
    console.log("INIT");
    App.socket.on('draw', function(data) {
      return App.draw(data.x, data.y, data.type);
    });

    App.draw = function(x, y, type) {
      if (type === "dragstart") {
        console.log("start");
        App.ctx.beginPath();
        return App.ctx.moveTo(x, y);
      } else if (type === "drag") {
        App.ctx.lineTo(x, y);
        return App.ctx.stroke();
      } else {
        console.log("close");
        return App.ctx.closePath();
      }
    };
  };


  $('canvas').live('drag dragstart dragend', function(e) {
    var offset, type, x, y;

    type = e.handleObj.type;
    offset = $(this).offset();
    e.offsetX = e.clientX - offset.left;
    e.offsetY = e.clientY - offset.top;
    x = e.offsetX;
    y = e.offsetY;
    App.draw(x, y, type);
    App.socket.emit('drawClick', {
      x: x,
      y: y,
      type: type
    });
  });

  App.init();
