let pWindowWidth;

let capture;
// webカメラのロードフラグ
let videoDataLoaded = false;

let buttonStart;
let buttonLoading;
let buttonStop;
let buttonView;
let buttonTrack;

let sliderVelocity;

let radioMode;

let onHandTracking = false;
let onView = false;

let handsfree;

const circleSize = 12;

const targetIndex = [4, 8, 12, 16, 20];
const palette = ["#9b5de5", "#f15bb5", "#fee440", "#00bbf9", "#00f5d4"];

// const note_colors = [{8:["C", (  0,   0, 255)], 12:["D", (  0, 255, 255)], 16:["E", (  0, 128,   0)], 20:["F", (  0, 255,   0)]},
//                      {8:["G", (255, 255,   0)], 12:["A", (128,   0, 128)], 16:["B", ( 128,  0, 255)], 20:["C", (  0,   0, 255)]}
//                     ];

const note_colors = [{8:["C", "#4040ff"], 12:["D", "#ffa040"], 16:["E", "#ff00ff"], 20:["F", "#00ff00"]},
                    {8:["G", "#0085ff"], 12:["A", "#fee440"], 16:["B", "#a000ff"], 20:["C", "#00f5d4"]}
                   ];

// const tones = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
const leftTones = [["C3", "D3", "E3", "F3"], ["C4", "D4", "E4", "F4"], ["C5", "D5", "E5", "F5"]];
const rightTones = [["G3", "A3", "B3", "C4"], ["G4", "A4", "B4", "C5"], ["G5", "A5", "B5", "C6"]];
let toneShift = [1,1];
const singleTones = [["G3", "A3", "B3", "C4"], ["C4", "D4", "E4", "F4"], ["G4", "A4", "B4", "C5"]];
// let times = [Tone.now(),Tone.now(),Tone.now(),Tone.now()];
let leftTimes = [Tone.now(),Tone.now(),Tone.now(),Tone.now()];
let rightTimes = [Tone.now(),Tone.now(),Tone.now(),Tone.now()];
// let trigger = [false, false, false, false];
let leftTrigger = [false, false, false, false];
let rightTrigger = [false, false, false, false];

function setup() {
  // createCanvas(640, 480);
  capture = createCapture(VIDEO);
  // createCanvas(capture.width, capture.height);
  // 映像をロードできたらキャンバスの大きさを設定
  capture.elt.onloadeddata = function () {
    videoDataLoaded = true;
    // createCanvas(capture.width, capture.height);
    let canvas = createCanvas(windowWidth, windowHeight*0.9);
    pWindowWidth = windowWidth;
    canvas.position(0, height/10);
  };

  

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
  // handsfree.enablePlugins('browser');
  // handsfree.plugin.pinchScroll.disable()
  // handsfree.start();
  
  sizeButton = [windowWidth/10, windowHeight/10];
  textSize(20);
  buttonStart = createButton('Start');
  buttonStart.size(sizeButton[0], sizeButton[1]-20);
  buttonStart.position(0, 5);
  buttonStart.style("font-size: x-large");
  buttonStart.class('handsfree-show-when-stopped');
  buttonStart.class('handsfree-hide-when-loading');
  buttonStart.mousePressed(() => handsfree.start());
  
  buttonLoading = createButton('...loading...');
  buttonLoading.size(sizeButton[0], sizeButton[1]-20);
  buttonLoading.position(0, 5);
  buttonLoading.style("font-size: x-large");
  buttonLoading.class('handsfree-show-when-loading');

  // Create a stop button
  buttonStop = createButton('Stop');
  buttonStop.size(sizeButton[0], sizeButton[1]-20);
  buttonStop.position(0, 5);
  buttonStop.style("font-size: x-large");
  buttonStop.class('handsfree-show-when-started');
  buttonStop.mousePressed(() => handsfree.stop());

  buttonView = createButton("View on");
  buttonView.mousePressed(starCameraView);
  buttonView.size(sizeButton[0], sizeButton[1]-20);
  buttonView.position(sizeButton[0], 5);
  buttonView.style("font-size: x-large");

  buttonTrack = createButton("track");
  buttonTrack.mousePressed(startHandTracking);
  buttonTrack.size(sizeButton[0], sizeButton[1]-20);
  buttonTrack.position(sizeButton[0]*2, 5);
  buttonTrack.style("font-size: x-large");

  sliderVelocity = createSlider(0, 1, 0.5, 0.01);
  sliderVelocity.position(sizeButton[0]*3+30, sizeButton[1]/2-15);
  
  radioMode = createRadio();
  radioMode.position(sizeButton[0]*3+30, sizeButton[1]/2+15);
  radioMode.option("Double hand");
  radioMode.option("Single hand");
  radioMode.selected("Double hand");

  // 映像を非表示化
  capture.hide();
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
  line(0, height/3, width, height/3);
  line(0, height*2/3, width, height*2/3);

  // 手の頂点を表示
  
  if(onHandTracking){
    if(radioMode.value() == "Double hand"){
      drawDoubleHands();
      playDoubleHandsSound();
    }else if(radioMode.value() == "Single hand"){
      drawSingleHands();
      playSingleHandsSound();
    }
    
  }

  updateView();
}

function updateView(){
  if(pWindowWidth != windowWidth){
    resizeCanvas(windowWidth, windowHeight);
    sizeButton = [windowWidth/10, windowHeight/10];
    buttonStart.size(sizeButton[0], sizeButton[1]-20);
    buttonStart.position(0, 5);
    buttonLoading.size(sizeButton[0], sizeButton[1]-20);
    buttonLoading.position(0, 5);
    buttonStop.size(sizeButton[0], sizeButton[1]-20);
    buttonStop.position(0, 5);
    buttonView.size(sizeButton[0], sizeButton[1]-20);
    buttonView.position(sizeButton[0], 5);
    buttonTrack.size(sizeButton[0], sizeButton[1]-20);
    buttonTrack.position(sizeButton[0]*2, 5);
    sliderVelocity.position(sizeButton[0]*3+30, sizeButton[1]/2-15);
    radioMode.position(sizeButton[0]*3+30, sizeButton[1]/2+15);
  }
  pWindowWidth = windowWidth;
}

function starCameraView(){
  if(onView){
    buttonView.html("View on");
  }else{
    buttonView.html("view off");
  }
  onView = !onView;
}

function startHandTracking(){
  if(onHandTracking){
    buttonTrack.html("track");
  }else{
    buttonTrack.html("untrack");
  }
  onHandTracking = !onHandTracking;
}

function drawDoubleHands() {
  
  const hands = handsfree.data?.hands;

  // 手が検出されなければreturn
  if (!hands?.multiHandLandmarks) return;

  const zip = (array1, array2) => array1.map((_, i) => [array1[i], array2[i]]);
  zip(hands.multiHandLandmarks, hands.multiHandedness).forEach(([hand, handedness]) => {
    
  // });

  // // 手の数だけlandmarkの地点にcircleを描写
  // hands.multiHandLandmarks.forEach((hand, handIndex) => {
    label = handedness["label"] == 'Left' ? 1 : 0;
    hand.forEach((landmark, landmarkIndex) => {
      // 指先だけ色を変更
      push();
      switch (landmarkIndex) {
        // case 4:
        //   fill(palette[0]);
        //   break;
        // case 8:
        //   fill(palette[1]);
        //   break;
        // case 12:
        //   fill(palette[2]);
        //   break;
        // case 16:
        //   fill(palette[3]);
        //   break;
        // case 20:
        //   fill(palette[4]);
        //   break;
        case 4:
          fill("#9b5de5");
          circle(width - landmark.x * width, landmark.y * height, circleSize*2);
          break;
        case 8:
        case 12:
        case 16:
        case 20:
          // print(note_colors)
          // print(note_colors[handIndex][landmarkIndex]);
          fill(note_colors[label][landmarkIndex][1]);
          // fill(color(note_colors[handIndex][landmarkIndex][1][0], note_colors[handIndex][landmarkIndex][1][1], note_colors[handIndex][landmarkIndex][1][2]));
          circle(width - landmark.x * width, landmark.y * height, circleSize*2);
          // circle(width - landmark.x * width, landmark.y * height, circleSize);
          fill("#000000");
          textSize(16);
          textStyle(BOLD);
          text(note_colors[label][landmarkIndex][0], width - landmark.x * width-textWidth(note_colors[label][landmarkIndex][0])/2, landmark.y * height+textWidth(note_colors[label][landmarkIndex][0])/2);
          break;
        case 21:
          let y = landmark.y*height;
          print(landmark.y, y, height/3);
          if(y < height/3){
            toneShift[label] = 2;
          }else if(y >= height/3 && y < height*2/3){
            toneShift[label] = 1;
          }else{
            toneShift[label] = 0;
          }
          fill(color(255, 255, 255));
          circle(width - landmark.x * width, landmark.y * height, circleSize);
          break;
        default:
          fill(color(255, 255, 255));
          circle(width - landmark.x * width, landmark.y * height, circleSize);
      }
      pop();
      // circle(width - landmark.x * width, landmark.y * height, circleSize);
    });
  });

  // console.log(handsfree.data.hands.pinchState[0])
  
}

function playDoubleHandsSound(){
  velocity = sliderVelocity.value();

  const hands = handsfree.data?.hands;
  if (!hands?.multiHandLandmarks) return;

  // index, middle, ring, pinky
  const leftHandPinch  = hands.pinchState[0]
  const rightHandPinch = hands.pinchState[1]

  let tone_array = [];
  leftHandPinch.forEach((handPinch, index) => {
    if (handPinch == "held" && !leftTrigger[index]){
      leftTimes[index] = Tone.now();
      leftSynth[index].triggerAttack(leftTones[toneShift[0]][index], leftTimes[index], velocity);
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
      rightSynth[index].triggerAttack(rightTones[toneShift[1]][index], rightTimes[index], velocity);
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

function drawSingleHands() {
  
  const hands = handsfree.data?.hands;
  if (!hands?.multiHandLandmarks) return;

  const zip = (array1, array2) => array1.map((_, i) => [array1[i], array2[i]]);
  zip(hands.multiHandLandmarks, hands.multiHandedness).forEach(([hand, handedness]) => {

    label = handedness["label"] == 'Left' ? 1 : 0;
    hand.forEach((landmark, landmarkIndex) => {
      push();
      switch (landmarkIndex) {
        case 4:
          fill("#9b5de5");
          circle(width - landmark.x * width, landmark.y * height, circleSize*2);
          break;
        case 8:
        case 12:
        case 16:
        case 20:
          fill(note_colors[(toneShift[label]+1)%2][landmarkIndex][1]);
          circle(width - landmark.x * width, landmark.y * height, circleSize*2);
          fill("#000000");
          textSize(16);
          textStyle(BOLD);
          text(note_colors[(toneShift[label]+1)%2][landmarkIndex][0], width - landmark.x * width-textWidth(note_colors[label][landmarkIndex][0])/2, landmark.y * height+textWidth(note_colors[label][landmarkIndex][0])/2);
          break;
        case 21:
          let y = landmark.y*height;
          print(landmark.y, y, height/3);
          if(y < height/3){
            toneShift[label] = 2;
          }else if(y >= height/3 && y < height*2/3){
            toneShift[label] = 1;
          }else{
            toneShift[label] = 0;
          }
          fill(color(255, 255, 255));
          circle(width - landmark.x * width, landmark.y * height, circleSize);
          break;
        default:
          fill(color(255, 255, 255));
          circle(width - landmark.x * width, landmark.y * height, circleSize);
      }
      pop();
    });
  });

  
}

function playSingleHandsSound(){
  velocity = sliderVelocity.value();

  const hands = handsfree.data?.hands;
  if (!hands?.multiHandLandmarks) return;

  // index, middle, ring, pinky
  const leftHandPinch  = hands.pinchState[0]
  const rightHandPinch = hands.pinchState[1]

  leftHandPinch.forEach((handPinch, index) => {
    if (handPinch == "held" && !leftTrigger[index]){
      leftTimes[index] = Tone.now();
      leftSynth[index].triggerAttack(singleTones[toneShift[0]][index], leftTimes[index], velocity);
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
      rightSynth[index].triggerAttack(singleTones[toneShift[1]][index], rightTimes[index], velocity);
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