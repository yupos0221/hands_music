let capture;
// webカメラのロードフラグ
let videoDataLoaded = false;

let handsfree;

const circleSize = 12;

const targetIndex = [4, 8, 12, 16, 20];
const palette = ["#9b5de5", "#f15bb5", "#fee440", "#00bbf9", "#00f5d4"];

const tones = ["C4", "D4", "E4", "F4"]
let times = [Tone.now(),Tone.now(),Tone.now(),Tone.now()];
let trigger = [false, false, false, false];

function setup() {
  // webカメラの映像を準備
  capture = createCapture(VIDEO);

  // 映像をロードできたらキャンバスの大きさを設定
  capture.elt.onloadeddata = function () {
    videoDataLoaded = true;
    createCanvas(capture.width, capture.height);
  };

  // 映像を非表示化
  capture.hide();

  // handsfreeのhandモデルを準備
  handsfree = new Handsfree({
    // showDebug: true,
    hands: true,
    // The maximum number of hands to detect [0 - 4]
    maxNumHands: 2,

    // Minimum confidence [0 - 1] for a hand to be considered detected
    minDetectionConfidence: 0.5,

    // Minimum confidence [0 - 1] for the landmark tracker to be considered detected
    // Higher values are more robust at the expense of higher latency
    minTrackingConfidence: 1.0
  });

  // handsfreeを開始
  handsfree.start();
  
}

function draw() {
  // 映像を左右反転させて表示
  push();
  translate(width, 0);
  scale(-1, 1);
  image(capture, 0, 0, width, height);
  pop();

  // 手の頂点を表示
  drawHands();
  playHandsSound();
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
  rightHandPinch.forEach((handPinch, index) => {
    if (handPinch == "held" && !trigger[index]){
      times[index] = Tone.now();
      synth[index].triggerAttack(tones[index], times[index]);
      trigger[index] = true;
    }else if(handPinch == "released" && trigger[index]){
      // console.log("stop")
      synth[index].triggerRelease()
      trigger[index] = false;
    }
  });
  console.log(trigger)

  

  // console.log(rightHandPinch)
  // start, held, released
  // if (rightHandPinch[0] == "held" && !trigger[0]){
  //   times[0] = Tone.now()
  //   synth.triggerAttack(tones[0]);
  //   // synth.triggerAttack(tones[0], times[0]);
  //   trigger[0] = true;
  //   console.log("play sound")
  // }else if(rightHandPinch[0] == "released" && trigger[0]){
  //   // now = Tone.now()
  //   synth.triggerRelease()
  //   // synth.triggerRelease(times[0])
  //   trigger[0] = false;
  //   console.log("stop")
  // }else{
  //   console.log(rightHandPinch[0], trigger[0])
  // }

  // if (rightHandPinch[1] == "held" && !trigger[1]){
  //   times[1] = Tone.now()
  //   synth.triggerAttack(tones[1], times[1]);
  //   trigger[1] = true;
  //   console.log("play sound")
  // }else if(rightHandPinch[1] == "released" && trigger[1]){
  //   // now = Tone.now()
  //   synth.triggerAttackRelease(tones[1], times[1])
    
  //   trigger[1] = false;
  //   console.log("stop")
  // }else{
  //   console.log(rightHandPinch[1], trigger[1])
  // }

}