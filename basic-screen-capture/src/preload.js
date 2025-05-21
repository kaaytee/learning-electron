const { contextBridge } = require('electron');
const { desktopCapturer } = require('@electron/remote');
const fs = require('fs');
const path = require('path');

// change to a dir you want to save the recordings to
const recordingsDir = "CHANGE THIS";
if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}


contextBridge.exposeInMainWorld(
  'electron',
  {
    desktopCapturer: {
      getSources: (opts) => desktopCapturer.getSources(opts)
    },
    fs: {
      writeFile: (data, filename) => {
        const filePath = path.join(recordingsDir, filename);
        const buffer = Buffer.from(data);
        fs.writeFileSync(filePath, buffer);
      },
      getSize: () => {
        return fs.readdirSync(recordingsDir).length;
      }
    },
    saveDir: () => recordingsDir
  }
);
