let capture;
// webカメラのロードフラグ
let videoDataLoaded = false;

let viewButton;
let handsButton;
let onHandTracking = false;
let onView = false;

let handsfree;

const circleSize = 12;

const targetIndex = [4, 8, 12, 16, 20];
const palette = ["#9b5de5", "#f15bb5", "#fee440", "#00bbf9", "#00f5d4"];

// const tones = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
const leftTones = ["C4", "D4", "E4", "F4"];
const rightTones = ["G4", "A4", "B4", "C5"];
// let times = [Tone.now(),Tone.now(),Tone.now(),Tone.now()];
let leftTimes = [Tone.now(),Tone.now(),Tone.now(),Tone.now()];
let rightTimes = [Tone.now(),Tone.now(),Tone.now(),Tone.now()];
// let trigger = [false, false, false, false];
let leftTrigger = [false, false, false, false];
let rightTrigger = [false, false, false, false];

function setup() {
  capture = createCapture(VIDEO);
  // createCanvas(capture.width, capture.height);
  // 映像をロードできたらキャンバスの大きさを設定
  capture.elt.onloadeddata = function () {
    videoDataLoaded = true;
    createCanvas(capture.width, capture.height);
    // createCanvas(windowWidth, windowHeight);
  };

  // 映像を非表示化
  capture.hide();

  viewButton = createButton("View on");
  viewButton.mousePressed(starCameraView);
  viewButton.size(70, 30);

  handsButton = createButton("track");
  handsButton.mousePressed(startHandTracking);
  handsButton.size(70, 30);


  // handsfreeのhandモデルを準備
  handsfree = new Handsfree({
    // showDebug: true,
    hands: true,
    // The maximum number of hands to detect [0 - 4]
    maxNumHands: 0,

    // Minimum confidence [0 - 1] for a hand to be considered detected
    minDetectionConfidence: 0.5,

    // Minimum confidence [0 - 1] for the landmark tracker to be considered detected
    // Higher values are more robust at the expense of higher latency
    minTrackingConfidence: 1.0
  });

  // handsfreeを開始
  handsfree.enablePlugins('browser');
  handsfree.start();
  
}

function draw() {
  if(onView){
    // 映像を左右反転させて表示
    push();
    translate(width, 0);
    scale(-1, 1);
    image(capture, 0, 0, width, height);
    pop();
  }else{
    background(128);
  }

  // 手の頂点を表示
  
  if(onHandTracking){
    drawHands();
    playHandsSound();
  }
  

}

function starCameraView(){
  if(onView){
    viewButton.html("View on");
  }else{
    viewButton.html("view off");
  }
  onView = !onView;
}

function startHandTracking(){
  if(onHandTracking){
    handsButton.html("track");
  }else{
    handsButton.html("untrack");
  }
  onHandTracking = !onHandTracking;
}

function drawHands() {
  const hands = handsfree.data?.hands;

  // 手が検出されなければreturn
  if (!hands?.multiHandLandmarks) return;

  // 手の数だけlandmarkの地点にcircleを描写
  hands.multiHandLandmarks.forEach((hand, handIndex) => {
    hand.forEach((landmark, landmarkIndex) => {
      // 指先だけ色を変更
      switch (landmarkIndex) {
        case 4:
          fill(palette[0]);
          break;
        case 8:
          fill(palette[1]);
          break;
        case 12:
          fill(palette[2]);
          break;
        case 16:
          fill(palette[3]);
          break;
        case 20:
          fill(palette[4]);
          break;
        default:
          fill(color(255, 255, 255));
      }
      circle(width - landmark.x * width, landmark.y * height, circleSize);
    });
  });

  // console.log(handsfree.data.hands.pinchState[0])
  
}

function playHandsSound(){

  const hands = handsfree.data?.hands;
  if (!hands?.multiHandLandmarks) return;

  // index, middle, ring, pinky
  const leftHandPinch  = hands.pinchState[0]
  const rightHandPinch = hands.pinchState[1]

  let tone_array = [];
  leftHandPinch.forEach((handPinch, index) => {
    if (handPinch == "held" && !leftTrigger[index]){
      leftTimes[index] = Tone.now();
      leftSynth[index].triggerAttack(leftTones[index], leftTimes[index]);
      leftTrigger[index] = true;
    }else if(handPinch == "released" && leftTrigger[index]){
      // console.log("stop")
      leftSynth[index].triggerRelease()
      leftTrigger[index] = false;
    }
  });

  rightHandPinch.forEach((handPinch, index) => {
    if (handPinch == "held" && !rightTrigger[index]){
      rightTimes[index] = Tone.now();
      rightSynth[index].triggerAttack(rightTones[index], rightTimes[index]);
      rightTrigger[index] = true;
    }else if(handPinch == "released" && rightTrigger[index]){
      // console.log("stop")
      rightSynth[index].triggerRelease()
      rightTrigger[index] = false;
    }
  });
  console.log(leftTrigger);
  console.log(rightTrigger);

}

// function mouseClicked(){
//   if(started){
//       capture.pause();
//   }else{
//       capture.play();
//   }
//   started = !started;
// }

// // for mobile browser
// function touchStarted(){
//   onHandTracking = !onHandTracking;
// }