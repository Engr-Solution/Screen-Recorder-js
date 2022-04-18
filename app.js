window.addEventListener("load", () => {
  startButton = document.querySelector("#start");
  stopButton = document.querySelector("#stop");
  downloadButton = document.querySelector("#download");
  recordingVideo = document.querySelector("#recorder");
  recordedVideo = document.querySelector("#recorded");

  startButton.addEventListener("click", startRecording);
  stopButton.addEventListener("click", stopRecording);
});

let stream = null,
  audio = null,
  mixedStream = null,
  chunks = [],
  recorder = null,
  startButton = null,
  stopButton = null,
  downloadButton = null,
  recordingVideo = null,
  recordedVideo = null;

async function setupStream() {
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    audio = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    });

    setupVideoFeedback();
  } catch (err) {
    console.error(err);
  }
}

function setupVideoFeedback() {
  if (stream) {
    recordingVideo.srcObject = stream;
    recordingVideo.play();
    console.log(stream);
  } else {
    console.warn("No stream available");
  }
}

async function startRecording() {
  await setupStream();

  if (stream && audio) {
    mixedStream = new MediaStream([
      ...stream.getTracks(),
      ...audio.getTracks(),
    ]);
    recorder = new MediaRecorder(mixedStream);
    recorder.ondataavailable = handleDataAvailable;
    recorder.onstop = handleStop;
    recorder.start(1000);

    startButton.disabled = true;
    downloadButton.disabled = true;
    stopButton.disabled = false;
    stopButton.classList.remove("disabled");
    startButton.classList.add("disabled");
    downloadButton.classList.add("disabled");

    console.log(mixedStream, recorder);
  } else {
    console.warn("No stream available.");
  }
}

function stopRecording() {
  recorder.stop();

  startButton.disabled = false;
  downloadButton.disabled = false;
  stopButton.disabled = true;
  stopButton.classList.add("disabled");
  startButton.classList.remove("disabled");
  downloadButton.classList.remove("disabled");
}

function handleDataAvailable(e) {
  chunks.push(e.data);
}

function handleStop(e) {
  const blob = new Blob(chunks, { type: "video/mp4" });
  chunks = [];

  downloadButton.href = URL.createObjectURL(blob);
  downloadButton.download = "video.mp4";
  recordedVideo.src = URL.createObjectURL(blob);
  recordedVideo.load();
  recordedVideo.onloadeddata = function () {
    document.querySelector('.recordedWrap').classList.remove('hide');
    recordedVideo.scrollIntoView({ behavior: "smooth", block: "start" });
    recordedVideo.play();
  };

  stream.getTracks().forEach((track) => track.stop());
  audio.getTracks().forEach((track) => track.stop());

  console.log(blob);
}
