var Canvas = require('canvas');

/*
 * get random float value amount [start, end)
 */
var randFloat = function(start, end) {
  return start + Math.random() * (end - start);
};

/*
 * get random integer value amount [start, end)
 */
var randInt = function(start, end) {
  return Math.floor(Math.random() * (end - start)) + start;
};

module.exports = function () {
  var W = 90;
  var H = 30;
  var canvas = new Canvas(W, H);
  var ctx = canvas.getContext('2d');
  var items = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPRSTUVWXYZ23456789'.split('');
  var vcode = '';

  ctx.fillStyle = '#f3fbfe';
  ctx.fillRect(0, 0, 90, 30);
  ctx.globalAlpha = .8;
  ctx.font = '15px sans-serif';

  for (var i = 0; i < 10; i++) {
    ctx.fillStyle = 'rgb(' + randInt(150, 225) + ',' + randInt(150, 225) + ',' + randInt(150, 225) + ')';
    for (var j = 0; j < 5; j++) {
      ctx.fillText(items[randInt(0, items.length)], randFloat(-10, W + 10), randFloat(-10, H + 10));
    }
  }

  var color = 'rgb(' + randInt(1, 120) + ',' + randInt(1, 120) + ',' + randInt(1, 120) + ')';
  ctx.font = 'bold 24px sans-serif';

  for (var i = 0; i < 4; i++) {
    var j = randInt(0, items.length);
    ctx.fillStyle = color;
    ctx.fillText(items[j], 5 + i * 23, 30);
    ctx.fillText(items[j], 0, 0);
    vcode += items[j];
  }

  ctx.beginPath();
  ctx.strokeStyle = color;
  var A = randFloat(10, H / 2);
  var b = randFloat(H / 4, 3 * H / 4);
  var f = randFloat(H / 4, 3 * H / 4);
  var T = randFloat(H * 1.5, W);
  var w = 2 * Math.PI / T;
  var S = function(x) {
    return A * Math.sin(w * x + f) + b;
  };
  ctx.lineWidth = 3;
  for (var x = -20; x < 200; x += 4) {
    ctx.moveTo(x, S(x));
    ctx.lineTo(x + 3, S(x + 3));
  }
  ctx.closePath();
  ctx.stroke();

  return {
    code: vcode.toLowerCase(),
    dataURL: canvas.toDataURL()
  };
};