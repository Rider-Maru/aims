var ClickNum = 0;
var AutorizeNum = 0;

var isPushKey = false;
var isAuthorizable = false;
var onStandBy = false;
var onAuthorize = false;

var preRingNum;
var preSlideNum;


//var mySwiper.realIndex = 0;

var threshold = 23;
//videoタグを取得
var video = document.getElementById("video");
//取得するメディア情報を指定
var medias = { audio: false, video: {} };

var mySwiper = new Swiper('.swiper-container', {
    loop: true,
});

function finishAudioLoading() {
    if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)) {
        medias.video.facingMode = { exact: "environment" };
    } else {
        medias.video.facingMode = { exact: "user" };
    }

    document.getElementById("str").textContent = "environment";

    //getUserMediaを用いて、webカメラの映像を取得
    navigator.mediaDevices.getUserMedia(medias).then(
        function (stream) {
            //videoタグのソースにwebカメラの映像を指定
            video.srcObject = stream;

        }
    ).catch(
        function (err) {
            //カメラの許可がされなかった場合にエラー
            window.alert("not allowed to use camera");
        }
    );
}
var canvas = document.getElementById("canvas");
//ビデオのメタデータが読み込まれるまで待つ
video.addEventListener("loadedmetadata", function (e) {
    //canvasにカメラの映像のサイズを設定
    canvas.width = video.videoWidth/3;
    canvas.height = video.videoHeight/3;

    //getContextで描画先を取得
    var ctx = canvas.getContext("2d");
    //毎フレームの実行処理
    setInterval(function (e) {
        if (mySwiper.realIndex != preSlideNum) {
            isAuthorizable = true;
            SEstandbyStop();
            AutorizeNum = 1;
            playSERotate();
            playSECallKey(1);
        }
        preSlideNum = mySwiper.realIndex;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        var imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imagedata.data;
        var allPicColor = 0;
        for (var i = 0; i < canvas.height; i++) {
            for (var j = 0; j < canvas.width; j++) {
                var index = (i * canvas.width + j) * 4;
                //元のピクセルカラーを取得
                var r = data[index + 0];
                var g = data[index + 1];
                var b = data[index + 2];

                //RGBをグレースケールに変換
                var color = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
                data[index + 0] = color;
                data[index + 1] = color;
                data[index + 2] = color;
                allPicColor += color;
            }
        }
        var val = allPicColor / (canvas.height * canvas.width);
        JudgeAutorize(val);
        document.getElementById("debug").textContent = val;
        ctx.putImageData(imagedata, 0, 0, 0, 0, canvas.width, canvas.height);
    }, 33);
        

});


function JudgeAutorize(value) {
    if (value < threshold) {
        if (!onAuthorize) {
            onAuthorize = true;
            document.getElementById("debug_bool").textContent = "true";
        }
 
    }
    else {
        if (onAuthorize) {
            onAuthorize = false;
            ringByCamera(1);
            document.getElementById("debug_bool").textContent = "false";
        }
       
    }
    
}

// ========================================
// 効果音を鳴らす（★今回のメインはこれ★）
// ========================================
function ring() {
    if (preRingNum == mySwiper.realIndex) {
        if (AutorizeNum == 2) {
            SEstandbyStop();
            playSECallFunction(mySwiper.realIndex);
            setTimeout(function () {
                if (onRingingStandby) isAuthorizable = true;
            }, 1000)
            AutorizeNum == 0;
            AutorizeNum = 3;
        } else if (AutorizeNum == 3) {
            SEstandbyStop();
            onStandBy = true;
            playSEFinishReady(mySwiper.realIndex);
            AutorizeNum = 4;
        } else if (AutorizeNum == 4) {
            SEstandbyStop();
            playSECallFinish(mySwiper.realIndex);
            AutorizeNum = 3;
        }
        else {
            isAuthorizable = true;
            SEstandbyStop();
            AutorizeNum = 1;
            playSECallKey(0);
        }
    }
    else {
        isAuthorizable = true;
        SEstandbyStop();
        AutorizeNum = 1;
        playSECallKey(mySwiper.realIndex);
        
    }
    preRingNum = mySwiper.realIndex;
}


function ringByCamera(callNum) {
    var isRing = false;
    if (!isAuthorizable) return;
    if (onStandBy) SEstandbyStop();
    if (callNum == 1 && AutorizeNum == 1) {
        isRing = true;
        onStandBy = true;
        playSEBelt(mySwiper.realIndex);
    }
    if (isRing) {
        isAuthorizable = false;
        setTimeout(function () {
            if (onRingingStandby || AutorizeNum == 3) isAuthorizable = true;
        }, 1000)

        if (AutorizeNum < 3) AutorizeNum++;
    }
}



function SEstandbyStop() {
    
    //SE_authorize.pause();
    //SE_authorize.currentTime = 0;
    //SE_progrise.pause();
    //SE_progrise.currentTime = 0;
    onStandBy = false;
    
    stopSE();
    if (AutorizeNum == 4) stopStandbyFinishSE();
    else stopStandbySE();
    
}


//-----------------------------------------------------------

