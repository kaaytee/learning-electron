let mediaRecorder;
let recordedChunks = [];

document.getElementById('start').addEventListener('click', async () => {
  try {
    const sources = await window.electron.desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 1280, height: 720 }
    });
    
    console.log('Available sources:', sources);
    
    const source = sources[0];
    if (source) {
      console.log(source)
      console.log('Selected source:', source.id, source.name);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id
          }
        },
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id,
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720
          }
        }
      });

      const videoElement = document.getElementById('video');
      videoElement.srcObject = stream;
      videoElement.muted = true;
      videoElement.play();

      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9,opus'
      });
      recordedChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, {
          type: 'video/webm; codecs=vp9,opus'
        });
        const url = URL.createObjectURL(blob);

        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        window.electron.fs.writeFile(Array.from(uint8Array), `${source.name}-recording-${window.electron.fs.getSize()}.webm`);
        
        window.URL.revokeObjectURL(url);
      };

      mediaRecorder.start(100);
    }
  } catch (e) {
    console.error('Error:', e);
  }
});

document.getElementById('stop').addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    const tracks = document.getElementById('video').srcObject.getTracks();
    tracks.forEach(track => track.stop());
    document.getElementById('status').innerHTML = 'saved to ' + window.electron.saveDir();

  }
});

document.getElementById('reset').addEventListener('click', () => {
  const videoElement = document.getElementById('video');
  if (videoElement.srcObject) {
    const tracks = videoElement.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    videoElement.srcObject = null;
  }
  recordedChunks = [];
});