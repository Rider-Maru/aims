window.AudioContext = window.AudioContext || window.webkitAudioContext;  
var context = new AudioContext();


var getAudioBuffer = function(url, fn) {  
  var request = new XMLHttpRequest();
  request.responseType = 'arraybuffer';

  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 0 || request.status === 200) {
        context.decodeAudioData(request.response, function(buffer) {
          fn(buffer);
        });
      }
    }
  };

  request.open('GET', url, true);
  request.send('');
};


var playSound = function(buffer) {  
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
};


// main
window.onload = function() {
  getAudioBuffer('audio/authorizeANDstandby.mp3', function(buffer1) {
    sample1 = buffer1;
    var btn1 = document.getElementById('btn1');
    btn1.onclick = function() {
      playSound(buffer1);
    };
  });
};