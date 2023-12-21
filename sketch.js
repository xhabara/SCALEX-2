// XHABARABOT SCALEX v2.0
// Created by Rully Shabara 2023

let osc, harmonyOsc, bassOsc;
let recorder, soundFile;
let recording = false;
let reverb, lowPassFilter;
let playing = false;
let harmonyEnabled = false;
let interlockingBassEnabled = false;
let harmonyPattern = "3rd and 5th"; // Default pattern
let bassPattern = "4th and Octave";
let interlockHarmonyRhythm = [
  true,
  false,
  false,
  true,
  false,
  false,
  false,
  true,
];
let rhythmPattern = [true, true, true, false, true, true, true, false];
let melodyRhythmPattern = [true, false, true, false, true, false, true, false];
let harmonyRhythmPattern = [false, true, false, true, false, true, false, true];
let bassRhythmPattern = [true, true, false, false, true, false, true, false];

let soundFile1, soundFile2, soundFile3;
let soundFilePlayButton;
let soundSelect;
let currentSoundFile;
let soundFilePlaying = false;
let stopSoundButton;
let soundReverb;

let scales = {
  Major: [0, 2, 4, 5, 7, 9, 11, 12],
  Minor: [0, 2, 3, 5, 7, 8, 10, 12],
  "Whole Tone": [0, 2, 4, 6, 8, 10, 12],
  Chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  Enigmatic: [0, 1, 4, 6, 8, 10, 11],
  Phrygian: [0, 1, 4, 5, 7, 8, 10, 12],
  Pelog: [0, 1, 3, 7, 8],
  Slendro: [0, 1, 5, 7, 10],
  Klezmer: [0, 2, 3, 6, 7, 8, 11, 12],
  Persian: [0, 1, 4, 5, 6, 8, 10, 11, 12],
  "Raag Bhairavi": [0, 1, 3, 5, 7, 8, 10],
  "Chinese (宫)": [0, 2, 4, 7, 9, 12],
  Hirajoshi: [0, 2, 3, 7, 8],
  Heptatonic: [0, 2, 4, 5, 7, 9, 10],
  "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11, 12],
  "Major Pentatonic": [0, 2, 4, 7, 9],
  "Maqam Bayati": [0, 1, 3, 5, 7, 8, 10],
  "African Kumoi": [0, 2, 3, 7, 9],
  Vietnamese: [0, 3, 5, 6, 7, 10],
  Hawaiian: [0, 2, 3, 5, 7, 10, 12],
};

let currentScale = [];
let melody = [];
let melodiesSequence = [];
let sequenceButtons = [];
let activeSequences = [];
let currentSequenceIndex = 0;
let currentNoteIndex = 0;
let noteDuration = 500;
let lastNoteTime = 0;
let bpm = 220;
let autoTempoChange = false;
let tempoChangeDirection = 1;
let interlockingHarmonyEnabled = false;
let interlockPattern = [4, 7]; // between a third (4 semitones) and a fifth (7 semitones)
let interlockIndex = 0;
let holdNotes = false;
let holdButton;



function preload() {
  soundFile1 = loadSound(
    "Rully-004.mp3",
    () => console.log("Sound 1 Loaded"),
    loadError
  );
  soundFile2 = loadSound(
    "Rully-025.mp3",
    () => console.log("Sound 2 Loaded"),
    loadError
  );
  soundFile3 = loadSound(
    "Rully-053.mp3",
    () => console.log("Sound 3 Loaded"),
    loadError
  );
}

function loadError(err) {
  console.log("Error loading sound file: ", err);
}

function setup() {
  createCanvas(700, 600);
  textAlign(CENTER, CENTER);

  osc = new p5.Oscillator("sine");
  harmonyOsc = new p5.Oscillator("sine");
  bassOsc = new p5.Oscillator("sine");
  osc.amp(0);
  harmonyOsc.amp(0);
  bassOsc.amp(0);
  osc.start();
  harmonyOsc.start();
  bassOsc.start();

  recorder = new p5.SoundRecorder();
  soundFile = new p5.SoundFile();

  soundReverb = new p5.Reverb();

  // Connect the sound files to the default reverb
  soundReverb.process(soundFile1, 3, 2);
  soundReverb.process(soundFile2, 3, 2);
  soundReverb.process(soundFile3, 3, 3);

  reverb = new p5.Reverb();
  let reverbSlider = createSlider(0, 1, 0, 0.01);
  reverbSlider.position(470, 350);
  reverbSlider.input(() => {
    if (reverbSlider.value() > 0) {
      reverb.process(osc, reverbSlider.value() * 3, 2);
      reverb.process(harmonyOsc, reverbSlider.value() * 3, 2);
      reverb.process(bassOsc, reverbSlider.value() * 3, 2);
    } else {
      reverb.drywet(0);
    }
  });

  lowPassFilter = new p5.LowPass();
  let filterSlider = createSlider(10, 22050, 22050, 10);
  filterSlider.position(470, 380);
  filterSlider.input(() => {
    lowPassFilter.freq(filterSlider.value());
  });

  osc.disconnect();
  harmonyOsc.disconnect();
  bassOsc.disconnect();
  osc.connect(lowPassFilter);
  harmonyOsc.connect(lowPassFilter);
  bassOsc.connect(lowPassFilter);
  lowPassFilter.connect(reverb);

  let interlockingBassButton = createButton("Bass Harmony");
  interlockingBassButton.id("interlocking-bass-button");
  interlockingBassButton.position(470, 260);
  interlockingBassButton.mousePressed(toggleInterlockingBass);

  let harmonyPatternSelect = createSelect();
  harmonyPatternSelect.id("harmony-pattern-select");
  harmonyPatternSelect.position(470, 215);
  harmonyPatternSelect.option("3rd and 5th");
  harmonyPatternSelect.option("4th and 6th");
  harmonyPatternSelect.option("5th and 6th");

  harmonyPatternSelect.changed(
    () => (harmonyPattern = harmonyPatternSelect.value())
  );

  let bassPatternSelect = createSelect();
  bassPatternSelect.id("bass-pattern-select");
  bassPatternSelect.position(470, 290);
  bassPatternSelect.option("4th and Octave");
  bassPatternSelect.option("5th and 7th");
  bassPatternSelect.option("3rd and 5th");

  bassPatternSelect.changed(() => (bassPattern = bassPatternSelect.value()));

  let harmonyOscTypeSelect = createSelect();
  harmonyOscTypeSelect.id("harmony-osc-type-select");
  harmonyOscTypeSelect.position(595, 215);
  harmonyOscTypeSelect.option("sine");
  harmonyOscTypeSelect.option("triangle");
  harmonyOscTypeSelect.option("sawtooth");
  harmonyOscTypeSelect.option("square");
  harmonyOscTypeSelect.changed(() =>
    harmonyOsc.setType(harmonyOscTypeSelect.value())
  );

  let bassOscTypeSelect = createSelect();
  bassOscTypeSelect.id("bass-osc-type-select");
  bassOscTypeSelect.position(595, 290);
  bassOscTypeSelect.option("sine");
  bassOscTypeSelect.option("triangle");
  bassOscTypeSelect.option("sawtooth");
  bassOscTypeSelect.option("square");
  bassOscTypeSelect.changed(() => bassOsc.setType(bassOscTypeSelect.value()));

  let scaleSelect = createSelect();
  scaleSelect.id("scale-select");
  scaleSelect.position(470, 30);
  for (let scale in scales) {
    scaleSelect.option(scale);
  }
  scaleSelect.changed(() => {
    currentScale = scales[scaleSelect.value()];
    generateMelody();
  });

  currentScale = scales["Major"]; // Default scale
  generateMelody();

  let newMelodyButton = createButton("GENERATE");
  newMelodyButton.position(470, 60);
  newMelodyButton.mousePressed(() => {
    generateMelody();
    highlightButton(newMelodyButton, false);
    highlightButton(addToSequenceButton, true);
  });
  highlightButton(newMelodyButton, true); // Initially highlighted

  
  let addToSequenceButton = createButton("Add to Sequence");
  addToSequenceButton.position(560, 60);
  addToSequenceButton.mousePressed(() => {
    addToSequence();
    highlightButton(newMelodyButton, true);
    highlightButton(addToSequenceButton, false);
  });

  let playSequenceButton = createButton("Play Sequence");
  playSequenceButton.id("play-sequence-button");
  playSequenceButton.position(470, 120);
  playSequenceButton.mousePressed(playSequence);

  let stopSequenceButton = createButton("Stop");
  stopSequenceButton.position(585, 120);
  stopSequenceButton.mousePressed(stopSequence);

  let undoSequenceButton = createButton("Undo");
  undoSequenceButton.position(635, 120);
  undoSequenceButton.mousePressed(undoSequence);

  let bpmInput = createInput("220");
  bpmInput.id("bpm-input");
  bpmInput.position(510, 430);
  bpmInput.size(30);

  let harmonyButton = createButton("Harmony");
  harmonyButton.id("harmony-button");
  harmonyButton.position(470, 185);
  harmonyButton.mousePressed(toggleHarmony);

  let interlockingHarmonyButton = createButton("Voice");
  interlockingHarmonyButton.id("interlocking-harmony-button");
  interlockingHarmonyButton.position(595, 185);
  interlockingHarmonyButton.mousePressed(toggleInterlockingHarmony);

  let bpmIncreaseButton = createButton("+");
  bpmIncreaseButton.position(470, 430);
  bpmIncreaseButton.mousePressed(() => adjustBPM(5)); // Increase BPM by 5

  let bpmDecreaseButton = createButton("-");
  bpmDecreaseButton.position(490, 430);
  bpmDecreaseButton.mousePressed(() => adjustBPM(-5));

  let autoTempoChangeButton = createButton("Increment");
  autoTempoChangeButton.id("auto-tempo-button");
  autoTempoChangeButton.position(470, 470);
  autoTempoChangeButton.mousePressed(toggleAutoTempoChange);

  let randomTempoButton = createButton("Immediate");
  randomTempoButton.position(545, 470);
  randomTempoButton.mousePressed(changeRandomTempo);

  function highlightButton(button, highlight) {
    if (highlight) {
      button.style("background-color", "#8B0C03"); 
    } else {
      button.style("background-color", ""); 
    }
  }

  soundSelect = createSelect();
  soundSelect.position(10, 10);
  soundSelect.option("Voice 1", "1");
  soundSelect.option("Voice 2", "2");
  soundSelect.option("Voice 3", "3");

  soundSelect.changed(() => {
    console.log("Selected Sound: ", soundSelect.value());

    switch (soundSelect.value()) {
      case "1":
        console.log("Setting currentSoundFile to soundFile1");
        currentSoundFile = soundFile1;
        break;
      case "2":
        console.log("Setting currentSoundFile to soundFile2");
        currentSoundFile = soundFile2;
        break;
      case "3":
        console.log("Setting currentSoundFile to soundFile3");
        currentSoundFile = soundFile3;
        break;
    }
  });

  currentSoundFile = soundFile1; // Default sound

  recordButton = createButton("Record");
  recordButton.position(470, 550);
  recordButton.mousePressed(toggleRecording);

  // Download Button
  let downloadButton = createButton("Download");
  downloadButton.position(530, 550);
  downloadButton.mousePressed(downloadRecording);

  // Connect the master output to the recorder
  recorder.setInput();
  
holdButton = createButton("Hold");
  holdButton.position(625, 470); // Adjust position as needed
  holdButton.mousePressed(toggleHoldNotes);
}

function toggleHoldNotes() {
  holdNotes = !holdNotes;
  updateHoldButtonAppearance();

  if (holdNotes) {
    // Logic to hold notes
    console.log("Holding notes");
  } else {
    // Logic to release notes
    console.log("Releasing notes");
    releaseNotes();
  }
}

function updateHoldButtonAppearance() {
  if (holdNotes) {
    holdButton.style('background-color', '#F44336'); 
    holdButton.html('Release');
  } else {
    holdButton.style('background-color', ''); 
    holdButton.html('Hold');
  }
}


function changeRandomTempo() {
  bpm = int(random(30, 380)); 
  noteDuration = 60000 / bpm;
  let bpmInput = select("#bpm-input");
  bpmInput.value(bpm);
}

function toggleSoundFilePlayback() {
  soundFilePlaying = !soundFilePlaying;

  if (soundFilePlaying) {
    soundFilePlayButton.html("Stop Sound File");
  } else {
    soundFilePlayButton.html("Play Sound File");
    if (currentSoundFile && currentSoundFile.isPlaying()) {
      currentSoundFile.stop(); 
    }
  }
}

function stopSoundFile() {
  console.log("Stop sound file button clicked");
  if (currentSoundFile && currentSoundFile.isPlaying()) {
    console.log("Stopping current sound file");
    currentSoundFile.stop();
  } else {
    console.log("No sound file is playing");
  }
}

function toggleRecording() {
  if (!recording) {
    recorder.record(soundFile);
    recordButton.html("Stop");
  } else {
    recorder.stop();
    recordButton.html("Record");
  }
  recording = !recording;
}

function downloadRecording() {
  if (soundFile && soundFile.duration() > 0) {
    saveSound(soundFile, "Xhabarabot-Scalex2.wav");
  }
}

function draw() {
  background(0);

  // Display the sequence and play notes
  displaySequence();
  if (playing && millis() - lastNoteTime > noteDuration) {
    lastNoteTime = millis();
    playCurrentNote();
    if (autoTempoChange) {
      updateTempo();
    }
  }

  // vertical lines for column borders
  stroke(0, 255, 0); // Set line color to green
  strokeWeight(2); // Set line thickness

  let columnWidth = width / 3;
  let offsetFirstLine = 5;
  let offsetSecondLine = 26;
  line(columnWidth + offsetFirstLine, 0, columnWidth + offsetFirstLine, height);
  line(
    columnWidth * 2 - offsetSecondLine,
    0,
    columnWidth * 2 - offsetSecondLine,
    height
  );
}

function createSequenceButton(sequenceNumber) {
  let yPos = 500 + (sequenceNumber - 1) * 20;
  let sequenceButton = createButton("Sequence " + sequenceNumber);
  sequenceButton.position(600, yPos);
  sequenceButton.mousePressed(() => toggleSequence(sequenceNumber - 1));
  sequenceButton.addClass("button-active"); // Start as active
  sequenceButtons.push(sequenceButton);
}

function toggleSequence(sequenceIndex) {
  let index = activeSequences.indexOf(sequenceIndex);
  let button = sequenceButtons[sequenceIndex];

  if (index > -1) {
    activeSequences.splice(index, 1);
    button.removeClass("button-active");
    button.addClass("button-inactive");
  } else {
    activeSequences.push(sequenceIndex);
    button.removeClass("button-inactive");
    button.addClass("button-active");
  }
}

function adjustBPM(change) {
  bpm = max(10, bpm + change);
  noteDuration = 60000 / bpm;

  let bpmInput = select("#bpm-input");
  bpmInput.value(bpm);
}

function toggleAutoTempoChange() {
  autoTempoChange = !autoTempoChange;
  let autoTempoButton = select("#auto-tempo-button");
  if (autoTempoChange) {
    tempoChangeDirection = 1;
    autoTempoButton.addClass("button-active");
  } else {
    autoTempoButton.removeClass("button-active");
  }
}

function updateTempo() {
  if (bpm >= 180) {
    tempoChangeDirection = -1; // Switch to decreasing tempo
  } else if (bpm <= 60) {
    tempoChangeDirection = 1; // Switch to increasing tempo
  }
  adjustBPM(tempoChangeDirection * 5); // Change BPM gradually
}

function undoSequence() {
  if (melodiesSequence.length > 0) {
    melodiesSequence.pop();
    activeSequences.pop();
    removeLastSequenceButton();
  }
}

function removeLastSequenceButton() {
  let lastButton = sequenceButtons.pop();
  lastButton.remove();
}

function undoNote() {
  if (melody.length > 0) {
    melody.pop();
  }
}

function displaySequence() {
  let yPos = 100;
  for (let i = 0; i < melodiesSequence.length; i++) {
    let melody = melodiesSequence[i];
    for (let j = 0; j < melody.length; j++) {
      fill(activeSequences.includes(i) ? 150 : 100);
      if (playing && i === currentSequenceIndex && j === currentNoteIndex) {
        fill(255, 0, 0); // Highlight the current note
      }
      rect(50 + j * 20, yPos, 15, -melody[j] * 2); // Scale note height
    }
    yPos += 20;
  }
}

function playCurrentNote() {
  if (!holdNotes) {
  if (currentSequenceIndex < melodiesSequence.length) {
    let melody = melodiesSequence[currentSequenceIndex];

    if (currentNoteIndex < melody.length) {
      let noteValue = melody[currentNoteIndex];
      let mainNote = noteValue + 60; // Base octave for melody

      // Play melody note
      if (melodyRhythmPattern[currentNoteIndex]) {
        osc.freq(convertMidiToFreq(mainNote));
        osc.amp(0.5, 0.1); // Fade in
      } else {
        osc.amp(0); // Silence
      }

      // Play harmony note
      if (harmonyEnabled && harmonyRhythmPattern[currentNoteIndex]) {
        let harmonyNote = getHarmonyNote(mainNote, currentNoteIndex);
        harmonyOsc.freq(convertMidiToFreq(harmonyNote));
        harmonyOsc.amp(0.5, 0.3); // Fade in
      } else {
        harmonyOsc.amp(0); // Silence
      }

      // Play bass note
      if (interlockingBassEnabled && bassRhythmPattern[currentNoteIndex]) {
        let bassNote = getBassNote(mainNote, currentNoteIndex);
        bassOsc.freq(convertMidiToFreq(bassNote));
        bassOsc.amp(0.5, 0.5); // Fade in
      } else {
        bassOsc.amp(0); // Silence
      }

      // Handle sound file playback and rate
      if (
        interlockingHarmonyEnabled &&
        harmonyRhythmPattern[currentNoteIndex]
      ) {
        if (currentSoundFile && currentSoundFile.isLoaded()) {
          let harmonyNote = getHarmonyNote(mainNote, currentNoteIndex);
          let playbackRate = map(harmonyNote, 60, 72, 0.5, 1.5); 
          currentSoundFile.rate(playbackRate);

          if (!currentSoundFile.isPlaying()) {
            currentSoundFile.loop(); 
          }
        }
      } else if (currentSoundFile && currentSoundFile.isPlaying()) {
        currentSoundFile.pause(); 
      }

      currentNoteIndex++;
      if (currentNoteIndex >= melody.length) {
        currentNoteIndex = 0;
        currentSequenceIndex = findNextActiveSequence(currentSequenceIndex + 1);
      }
    }
  } else {
    stopPlaying(); // Stop playing if sequence is complete
  }
}
}

function releaseNotes() {
  osc.amp(0); // Release the main oscillator
  harmonyOsc.amp(0); // Release the harmony oscillator
  bassOsc.amp(0); // Release the bass oscillator
  
}

function stopAllSoundFiles() {
  [soundFile1, soundFile2, soundFile3].forEach((soundFile) => {
    if (soundFile.isPlaying()) {
      soundFile.stop();
    }
  });
}

function getHarmonyNote(mainNote, index) {
  if (harmonyPattern === "3rd and 5th") {
    return index % 2 === 0 ? mainNote + 4 : mainNote + 7; // 3rd or 5th
  } else if (harmonyPattern === "4th and 6th") {
    return index % 2 === 0 ? mainNote + 5 : mainNote + 9; // 4th or 6th
  }
  if (harmonyPattern === "5th and 6th") {
    return index % 2 === 0 ? mainNote + 7 : mainNote + 9;
  }
}

function getBassNote(mainNote, index) {
  // switch between a fourth below and an octave below based on the selected pattern
  if (bassPattern === "4th and Octave") {
    return index % 2 === 0 ? mainNote - 5 : mainNote - 12; // 4th or Octave
  } else if (bassPattern === "5th and 7th") {
    return index % 2 === 0 ? mainNote - 7 : mainNote - 10; // 5th or 7th
  }
  if (bassPattern === "3rd and 5th") {
    return index % 2 === 0 ? mainNote - 3 : mainNote - 7;
  }
}

function toggleInterlockingHarmony() {
  interlockingHarmonyEnabled = !interlockingHarmonyEnabled;
  let interlockHarmonyButton = select("#interlocking-harmony-button");
  if (interlockingHarmonyEnabled) {
    interlockIndex = 0;
    interlockHarmonyButton.addClass("button-active");
  } else {
    interlockHarmonyButton.removeClass("button-active");
  }
}

function calculateBassNote(mainNote, index) {
  // play a note a perfect fourth below the main note,
  // but alternate with an octave below every other note for interlocking effect
  return index % 2 === 0 ? mainNote - 5 : mainNote - 12;
}

function toggleInterlockingBass() {
  interlockingBassEnabled = !interlockingBassEnabled;
  let interlockBassButton = select("#interlocking-bass-button");
  if (interlockingBassEnabled) {
    bassOsc.amp(0.3, 0.5);
    interlockBassButton.addClass("button-active");
  } else {
    bassOsc.amp(0, 0.5);
    interlockBassButton.removeClass("button-active");
  }
}

function toggleHarmony() {
  harmonyEnabled = !harmonyEnabled;
  let harmonyButton = select("#harmony-button");
  if (harmonyEnabled) {
    
    harmonyButton.addClass("button-active");
  } else {
    
    harmonyButton.removeClass("button-active");
  }
}

function playSound() {
  console.log("Playing Sound: ", currentSoundFile);
  if (currentSoundFile && currentSoundFile.isLoaded()) {
    console.log("Sound file is loaded, attempting to play.");
    currentSoundFile.loop(); 
  } else {
    console.log("Sound file not loaded or encountered an error.");
  }
}

function findNextActiveSequence(startIndex) {
  for (let i = startIndex; i < melodiesSequence.length; i++) {
    if (activeSequences.includes(i)) {
      return i;
    }
  }
  return 0;
}

function addToSequence() {
  if (melodiesSequence.length < 17) {
    melodiesSequence.push([...melody]);
    let sequenceNumber = melodiesSequence.length;
    activeSequences.push(sequenceNumber - 1);
    createSequenceButton(sequenceNumber);
    generateMelody();
  } else {
    console.log("Maximum number of sequences reached (17)");
  }
}

function createSequenceButton(sequenceNumber) {
  let yPos = 60 + 30 * (sequenceNumber - 1);
  let sequenceButton = createButton("Sequence " + sequenceNumber);
  sequenceButton.position(300, yPos);
  sequenceButton.mousePressed(() => toggleSequence(sequenceNumber - 1));
  sequenceButton.addClass("button-active");
  sequenceButtons.push(sequenceButton);
}

function toggleSequence(sequenceIndex) {
  let index = activeSequences.indexOf(sequenceIndex);
  let button = sequenceButtons[sequenceIndex];

  if (index > -1) {
    activeSequences.splice(index, 1);
    button.removeClass("button-active");
    button.addClass("button-inactive");
  } else {
    activeSequences.push(sequenceIndex);
    button.removeClass("button-inactive");
    button.addClass("button-active");
  }
}

function playSequence() {
  if (activeSequences.length > 0) {
    currentSequenceIndex = findNextActiveSequence(0);
    currentNoteIndex = 0;
    startPlaying();
    let playButton = select("#play-sequence-button");
    playButton.addClass("button-active");
  }
}

function stopSequence() {
  playing = false;
  currentSequenceIndex = 0;
  currentNoteIndex = 0;
  let playButton = select("#play-sequence-button");
  playButton.removeClass("button-active");
}

function startPlaying() {
  playing = true;
  osc.amp(0.5, 0.5);
  lastNoteTime = millis();
}

function stopPlaying() {
  osc.amp(0, 0.5);
  playing = false;
  currentSequenceIndex = 0;
  currentNoteIndex = 0;
}

function convertMidiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function generateMelody() {
  melody = [];
  let scaleLength = currentScale.length;
  let octaveShifts = [-12, 0, 12]; 

  for (let i = 0; i < 8; i++) {
    let noteIndex = int(random(scaleLength));
    let note = currentScale[noteIndex];

    // random octave shift
    let octaveShift = random(octaveShifts);
    melody.push(note + octaveShift);
  }
}