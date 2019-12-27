var soundArray = [];
var bufferListUp = [];
var nowplay;
var nowplaynum;
var onRingingStandby = false;

    function BufferLoader(context, urlList, callback) {
        this.context = context;
        this.urlList = urlList;
        this.onload = callback;
        this.bufferList = new Array();
        this.loadCount = 0;
    }
    BufferLoader.prototype.loadBuffer = function (url, index) {
        // Load buffer asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        var loader = this;
        request.onload = function () {
            // Asynchronously decode the audio file data in request.response
            loader.context.decodeAudioData(
                request.response,
                function (buffer) {
                    if (!buffer) {
                        alert('error decoding file data: ' + url);
                        return;
                    }
                    loader.bufferList[index] = buffer;
                    if (++loader.loadCount == loader.urlList.length)
                        loader.onload(loader.bufferList);
                },
                function (error) {
                    console.error('decodeAudioData error', error);
                }
            );
        }
        request.onerror = function () {
            alert('BufferLoader: XHR error');
        }
        request.send();
    }
    BufferLoader.prototype.load = function () {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
    }
window.AudioContext = window.AudioContext || window.webkitAudioContext;
  
//-------------------------------------------    
'use strict';

var context, analyser, frequencies, getByteFrequencyDataAverage,  draw;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
context = new AudioContext();

analyser = context.createAnalyser();
frequencies = new Uint8Array(analyser.frequencyBinCount);

getByteFrequencyDataAverage = function () {
    analyser.getByteFrequencyData(frequencies);
    return frequencies.reduce(function (previous, current) {
        return previous + current;
    }) / analyser.frequencyBinCount;
};

// 透明度を変更する要素
var lightLayer = document.getElementsByClassName('square-button');
// 可能な限り高いフレームレートで音量を取得し、透明度に反映する
(draw = function () {
    
    // opacityの範囲である0〜1に変換
    var val = (getByteFrequencyDataAverage() / 255) * (getByteFrequencyDataAverage() / 255) * 7;
    for (var i = 0; i < lightLayer.length; i++){
        lightLayer[i].style.opacity = val;
    }
    document.getElementById("debug_gain").textContent = val;
    requestAnimationFrame(draw);
})();
//-------------------------------------------

//context = new AudioContext();
    bufferLoader = new BufferLoader(
        context,
        [
            'audio/authorize.mp3',
            'audio/standbyLoop.mp3',
            'audio/jump.mp3',
            'audio/risingHopper.mp3',
            'audio/wing.mp3',
            'audio/flyingFalcon.mp3',
            'audio/fang.mp3',
            'audio/bitingShark.mp3',
            'audio/fire.mp3',
            'audio/flamingTiger.mp3',
        ],
        finishedLoading
    );
    bufferLoader.load();
    function finishedLoading(bufferList) {
        //el = document.getElementsByClassName("sound");
        alert("ロードが完了しました");
        finishAudioLoading();
        for (var i = 0; i < bufferList.length; i++) {
            var source = context.createBufferSource();
            source.buffer = bufferList[i];
            bufferListUp[i] = bufferList[i];
            source.connect(context.destination);
            soundArray.push(source);
        }
}

function playSECallKey(callNum) {
    if (soundArray[0]== null) {
        alert('オーディオデータをロード中です');
        return;
    }
    var num = 2;
    num += callNum * 2;

    soundArray[num].connect(analyser);
    soundArray[num].start(0);
    soundArray[num] = context.createBufferSource();
    soundArray[num].buffer = bufferListUp[num];
    soundArray[num].connect(context.destination);
    
}

function playSE(num) {
    /*
    nowplay = soundArray[num];
    nowplaynum = num;
    nowplay.start(0);
    */
    nowplaynum = num;

    soundArray[nowplaynum].connect(analyser);
    soundArray[nowplaynum].start(0);
    if (nowplaynum == 0) {
        soundArray[0].onended = function () {
            if (nowplaynum == null) return;
            soundArray[1].loop = true;
            soundArray[1].start(0);
            onRingingStandby = true;
        }
    }
    
    /*
    soundArray[num].start(0);
    soundArray[num] = context.createBufferSource();
    soundArray[num].buffer = bufferListUp[num];
    soundArray[num].connect(context.destination);
    */
}

function stopSE() {
    if (nowplaynum == null) return;
    soundArray[nowplaynum].stop();
    soundArray[nowplaynum] = context.createBufferSource();
    soundArray[nowplaynum].buffer = bufferListUp[nowplaynum];
    soundArray[nowplaynum].connect(context.destination);
    
    nowplaynum = null;
}

function stopStandbySE() {
    if (!onRingingStandby) return;
    soundArray[1].stop();
    soundArray[1] = context.createBufferSource();
    soundArray[1].buffer = bufferListUp[1];
    soundArray[1].connect(context.destination);
    onRingingStandby = false;
}