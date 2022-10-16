var synth = [];
window.onload = function(){
  var context = new AudioContext();
  // synth = [new Tone.Synth().toMaster(), new Tone.Synth().toMaster(), new Tone.Synth().toMaster(), new Tone.Synth().toMaster()];
  leftSynth = [new Tone.Synth().toMaster(), new Tone.Synth().toMaster(), new Tone.Synth().toMaster(), new Tone.Synth().toMaster()]; 
  rightSynth = [new Tone.Synth().toMaster(), new Tone.Synth().toMaster(), new Tone.Synth().toMaster(), new Tone.Synth().toMaster()];  

}

window.addEventListener('mousedown', playSound);
window.addEventListener('touchstart', playSound);


function playSound(e) {
  
  // マウスのdata属性を取得
  var key = e.target.dataset.key;
  
  // keyがundefinedなら処理を実行しない
  if (typeof key === "undefined") return;  
  
  // 音名を代入する
  synth.triggerAttackRelease(key, '8n');
    
}

function play(){
  synth.triggerAttackRelease("C4", "4n");
}