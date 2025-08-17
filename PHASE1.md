# Phase 1 - MVP Core Recording Implementation

## Project Structure
```
neutralino-loom/
├── resources/
│   ├── index.html
│   ├── js/
│   │   ├── main.js
│   │   ├── recorder.js
│   │   ├── camera.js
│   │   ├── editor.js
│   │   └── storage.js
│   ├── css/
│   │   └── styles.css
│   └── ffmpeg/
│       ├── win/ffmpeg.exe
│       ├── mac/ffmpeg
│       └── linux/ffmpeg
├── neutralino.config.json
└── build/
```

## Core Configuration

### neutralino.config.json
```json
{
  "applicationId": "com.loomlite.app",
  "version": "1.0.0",
  "defaultMode": "window",
  "port": 0,
  "documentRoot": "/resources/",
  "url": "/",
  "enableServer": true,
  "enableNativeAPI": true,
  "nativeAllowList": [
    "app.*",
    "os.*",
    "filesystem.*",
    "storage.*",
    "window.*",
    "events.*",
    "extensions.*",
    "clipboard.*"
  ],
  "modes": {
    "window": {
      "title": "Loom Lite",
      "width": 400,
      "height": 500,
      "minWidth": 350,
      "minHeight": 400,
      "icon": "/resources/icon.png",
      "enableInspector": false,
      "borderless": false,
      "maximize": false,
      "hidden": false,
      "resizable": true,
      "exitProcessOnClose": true
    }
  },
  "cli": {
    "binaryName": "loomlite",
    "resourcesPath": "/resources/",
    "extensionsPath": "/extensions/",
    "clientLibrary": "/resources/js/neutralino.js",
    "binaryVersion": "4.14.1",
    "clientVersion": "3.12.0"
  }
}
```

## HTML Structure

### index.html
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Loom Lite</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div id="app">
    <!-- Main Recording View -->
    <div id="mainView" class="view active">
      <div class="header">
        <h2>Loom Lite</h2>
        <button id="settingsBtn" class="icon-btn">⚙️</button>
      </div>
      
      <div class="control-panel">
        <!-- Camera Preview -->
        <div id="cameraPreview" class="camera-preview">
          <video id="previewVideo" autoplay muted></video>
          <div class="preview-placeholder">
            <span>📷 Camera Preview</span>
          </div>
        </div>
        
        <!-- Recording Options -->
        <div class="options-group">
          <label class="option">
            <input type="checkbox" id="cameraToggle" checked>
            <span>Include Camera</span>
          </label>
          <label class="option">
            <input type="checkbox" id="audioToggle" checked>
            <span>Record Audio</span>
          </label>
          <label class="option">
            <input type="checkbox" id="systemAudioToggle">
            <span>System Audio</span>
          </label>
        </div>
        
        <!-- Device Selection -->
        <div class="device-selection">
          <select id="cameraSelect" class="device-select">
            <option value="">Select Camera...</option>
          </select>
          <select id="micSelect" class="device-select">
            <option value="">Select Microphone...</option>
          </select>
        </div>
        
        <!-- Record Button -->
        <button id="recordBtn" class="record-button">
          <span class="record-icon"></span>
          <span class="button-text">Start Recording</span>
        </button>
        
        <!-- Hotkey Info -->
        <div class="hotkey-info">
          Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> to start/stop
        </div>
      </div>
    </div>

    <!-- Recording State View -->
    <div id="recordingView" class="view">
      <div class="recording-header">
        <span class="recording-dot"></span>
        <span>Recording...</span>
      </div>
      <div class="recording-info">
        <div id="recordingTime" class="timer">00:00</div>
        <div class="recording-controls">
          <button id="pauseBtn" class="control-btn">⏸️ Pause</button>
          <button id="stopBtn" class="control-btn stop">⏹️ Stop</button>
        </div>
      </div>
      <div class="minimize-hint">
        Window will minimize to system tray
      </div>
    </div>

    <!-- Review View -->
    <div id="reviewView" class="view">
      <div class="header">
        <h3>Review Recording</h3>
      </div>
      <video id="reviewVideo" controls></video>
      <div class="trim-controls">
        <input type="range" id="trimStart" min="0" max="100" value="0">
        <input type="range" id="trimEnd" min="0" max="100" value="100">
        <div class="trim-info">
          <span id="trimStartTime">00:00</span> - <span id="trimEndTime">00:00</span>
        </div>
      </div>
      <div class="review-actions">
        <button id="saveBtn" class="primary-btn">💾 Save</button>
        <button id="saveAsBtn" class="secondary-btn">Save As...</button>
        <button id="discardBtn" class="danger-btn">🗑️ Discard</button>
        <button id="recordAgainBtn" class="secondary-btn">Record Again</button>
      </div>
    </div>

    <!-- Settings View -->
    <div id="settingsView" class="view">
      <div class="header">
        <button id="backBtn" class="icon-btn">←</button>
        <h3>Settings</h3>
      </div>
      <div class="settings-content">
        <div class="setting-group">
          <h4>Recording Quality</h4>
          <select id="qualitySelect">
            <option value="low">Low (720p, 15fps)</option>
            <option value="medium" selected>Medium (1080p, 30fps)</option>
            <option value="high">High (1080p, 60fps)</option>
            <option value="ultra">Ultra (4K, 30fps)</option>
          </select>
        </div>
        <div class="setting-group">
          <h4>Output Format</h4>
          <select id="formatSelect">
            <option value="mp4" selected>MP4</option>
            <option value="webm">WebM</option>
            <option value="mkv">MKV</option>
          </select>
        </div>
        <div class="setting-group">
          <h4>Save Location</h4>
          <input type="text" id="saveLocation" readonly>
          <button id="browseSaveLocation">Browse...</button>
        </div>
        <div class="setting-group">
          <h4>Camera Position</h4>
          <select id="cameraPosition">
            <option value="bottom-right" selected>Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="top-right">Top Right</option>
            <option value="top-left">Top Left</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <script src="js/neutralino.js"></script>
  <script src="js/main.js"></script>
  <script src="js/recorder.js"></script>
  <script src="js/camera.js"></script>
  <script src="js/editor.js"></script>
  <script src="js/storage.js"></script>
</body>
</html>
```

## JavaScript Implementation

### main.js - Application Entry Point
```javascript
// Initialize Neutralino
Neutralino.init();

// Application state
const AppState = {
  currentView: 'main',
  isRecording: false,
  recordingPath: null,
  settings: {}
};

// View manager
class ViewManager {
  static showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${viewName}View`).classList.add('active');
    AppState.currentView = viewName;
  }
}

// Initialize app
async function initializeApp() {
  try {
    // Load saved settings
    AppState.settings = await StorageManager.loadSettings();
    
    // Initialize components
    await CameraManager.initialize();
    await Recorder.initialize();
    
    // Setup event listeners
    setupEventListeners();
    
    // Register global hotkey
    await registerHotkey();
    
    // Setup system tray
    await setupSystemTray();
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Initialization error:', error);
    await Neutralino.os.showMessageBox('Error', 
      `Failed to initialize: ${error.message}`);
  }
}

// Event listeners setup
function setupEventListeners() {
  // Record button
  document.getElementById('recordBtn').addEventListener('click', toggleRecording);
  document.getElementById('stopBtn').addEventListener('click', stopRecording);
  
  // View navigation
  document.getElementById('settingsBtn').addEventListener('click', () => {
    ViewManager.showView('settings');
  });
  
  document.getElementById('backBtn').addEventListener('click', () => {
    ViewManager.showView('main');
  });
  
  // Camera toggle
  document.getElementById('cameraToggle').addEventListener('change', (e) => {
    if (e.target.checked) {
      CameraManager.startPreview();
    } else {
      CameraManager.stopPreview();
    }
  });
  
  // Device selection
  document.getElementById('cameraSelect').addEventListener('change', (e) => {
    CameraManager.switchCamera(e.target.value);
  });
  
  // Review actions
  document.getElementById('saveBtn').addEventListener('click', saveRecording);
  document.getElementById('discardBtn').addEventListener('click', discardRecording);
  document.getElementById('recordAgainBtn').addEventListener('click', () => {
    discardRecording();
    ViewManager.showView('main');
  });
}

// Recording control
async function toggleRecording() {
  if (!AppState.isRecording) {
    await startRecording();
  } else {
    await stopRecording();
  }
}

async function startRecording() {
  try {
    const options = {
      withCamera: document.getElementById('cameraToggle').checked,
      withAudio: document.getElementById('audioToggle').checked,
      withSystemAudio: document.getElementById('systemAudioToggle').checked,
      cameraDevice: document.getElementById('cameraSelect').value,
      audioDevice: document.getElementById('micSelect').value,
      quality: AppState.settings.quality || 'medium',
      format: AppState.settings.format || 'mp4'
    };
    
    AppState.recordingPath = await Recorder.startRecording(options);
    AppState.isRecording = true;
    
    ViewManager.showView('recording');
    startTimer();
    
    // Minimize to tray after 2 seconds
    setTimeout(() => {
      Neutralino.window.minimize();
    }, 2000);
    
  } catch (error) {
    console.error('Failed to start recording:', error);
    await Neutralino.os.showMessageBox('Error', 
      `Failed to start recording: ${error.message}`);
  }
}

async function stopRecording() {
  try {
    await Recorder.stopRecording();
    AppState.isRecording = false;
    
    stopTimer();
    await Neutralino.window.unminimize();
    
    // Load video for review
    ViewManager.showView('review');
    document.getElementById('reviewVideo').src = AppState.recordingPath;
    
  } catch (error) {
    console.error('Failed to stop recording:', error);
    await Neutralino.os.showMessageBox('Error', 
      `Failed to stop recording: ${error.message}`);
  }
}

// Timer functionality
let timerInterval;
let recordingSeconds = 0;

function startTimer() {
  recordingSeconds = 0;
  timerInterval = setInterval(() => {
    recordingSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimerDisplay() {
  const minutes = Math.floor(recordingSeconds / 60);
  const seconds = recordingSeconds % 60;
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('recordingTime').textContent = display;
}

// Hotkey registration
async function registerHotkey() {
  // Platform-specific hotkey registration
  const platform = await Neutralino.os.platform();
  
  if (platform === 'Windows' || platform === 'Linux') {
    // Use Neutralino extensions or native module for global hotkeys
    // This is a simplified example
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        toggleRecording();
      }
    });
  } else if (platform === 'Darwin') {
    // macOS specific hotkey handling
    document.addEventListener('keydown', (e) => {
      if (e.metaKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        toggleRecording();
      }
    });
  }
}

// System tray setup
async function setupSystemTray() {
  // Note: Neutralino doesn't have built-in tray support
  // You'll need to use an extension or native module
  // This is placeholder code
  console.log('System tray setup would go here');
}

// Save recording
async function saveRecording() {
  try {
    const savePath = await Neutralino.os.showSaveDialog('Save Recording', {
      defaultPath: `recording_${Date.now()}.mp4`,
      filters: [
        {name: 'Video Files', extensions: ['mp4', 'webm', 'mkv']}
      ]
    });
    
    if (savePath) {
      await Neutralino.filesystem.copyFile(AppState.recordingPath, savePath);
      await Neutralino.os.showMessageBox('Success', 'Recording saved successfully!');
      ViewManager.showView('main');
    }
  } catch (error) {
    console.error('Failed to save recording:', error);
  }
}

// Discard recording
async function discardRecording() {
  try {
    await Neutralino.filesystem.removeFile(AppState.recordingPath);
    AppState.recordingPath = null;
    ViewManager.showView('main');
  } catch (error) {
    console.error('Failed to discard recording:', error);
  }
}

// Initialize when ready
Neutralino.events.on('ready', initializeApp);
Neutralino.events.on('windowClose', () => {
  Neutralino.app.exit();
});
```

### recorder.js - FFmpeg Recording Logic
```javascript
class Recorder {
  static ffmpegPath = null;
  static recordingProcess = null;
  static platform = null;
  
  static async initialize() {
    this.platform = await Neutralino.os.platform();
    this.ffmpegPath = this.getFFmpegPath();
    
    // Verify FFmpeg exists
    const exists = await this.verifyFFmpeg();
    if (!exists) {
      throw new Error('FFmpeg not found. Please ensure FFmpeg is in the ffmpeg folder.');
    }
  }
  
  static getFFmpegPath() {
    const paths = {
      'Windows': './resources/ffmpeg/win/ffmpeg.exe',
      'Darwin': './resources/ffmpeg/mac/ffmpeg',
      'Linux': './resources/ffmpeg/linux/ffmpeg'
    };
    return paths[this.platform] || './resources/ffmpeg/ffmpeg';
  }
  
  static async verifyFFmpeg() {
    try {
      const result = await Neutralino.os.execCommand(`${this.ffmpegPath} -version`);
      return result.exitCode === 0;
    } catch {
      return false;
    }
  }
  
  static async startRecording(options) {
    const timestamp = Date.now();
    const outputPath = `./temp/recording_${timestamp}.${options.format || 'mp4'}`;
    
    // Ensure temp directory exists
    try {
      await Neutralino.filesystem.createDirectory('./temp');
    } catch {}
    
    const command = this.buildCommand(options, outputPath);
    console.log('FFmpeg command:', command);
    
    // Start FFmpeg process
    this.recordingProcess = await Neutralino.os.spawnProcess(command);
    
    return outputPath;
  }
  
  static buildCommand(options, outputPath) {
    let inputs = [];
    let filters = [];
    let maps = [];
    
    // Screen capture input
    inputs.push(this.getScreenInput());
    maps.push('-map 0:v');
    
    // Camera input if enabled
    if (options.withCamera && options.cameraDevice) {
      inputs.push(this.getCameraInput(options.cameraDevice));
      filters.push(this.getCameraOverlay(options.cameraPosition || 'bottom-right'));
      maps.push('-map 1:v');
    }
    
    // Audio input if enabled
    if (options.withAudio && options.audioDevice) {
      inputs.push(this.getAudioInput(options.audioDevice));
      maps.push('-map 2:a');
    }
    
    // Build final command
    const quality = this.getQualitySettings(options.quality);
    let command = `${this.ffmpegPath} `;
    
    // Add all inputs
    inputs.forEach(input => {
      command += `${input} `;
    });
    
    // Add filters if any
    if (filters.length > 0) {
      command += `-filter_complex "${filters.join(';')}" `;
    }
    
    // Add quality settings and output
    command += `${quality} -y "${outputPath}"`;
    
    return command;
  }
  
  static getScreenInput() {
    switch (this.platform) {
      case 'Windows':
        return '-f gdigrab -framerate 30 -i desktop';
      case 'Darwin':
        return '-f avfoundation -framerate 30 -i "1:none"';
      case 'Linux':
        // Try to detect Wayland vs X11
        const isWayland = process.env.WAYLAND_DISPLAY;
        if (isWayland) {
          return '-f kmsgrab -framerate 30 -i -';
        } else {
          return '-f x11grab -framerate 30 -i :0.0';
        }
      default:
        return '-f gdigrab -framerate 30 -i desktop';
    }
  }
  
  static getCameraInput(deviceName) {
    switch (this.platform) {
      case 'Windows':
        return `-f dshow -i video="${deviceName}"`;
      case 'Darwin':
        return `-f avfoundation -i "${deviceName}"`;
      case 'Linux':
        return `-f v4l2 -i /dev/video0`;
      default:
        return '';
    }
  }
  
  static getAudioInput(deviceName) {
    switch (this.platform) {
      case 'Windows':
        return `-f dshow -i audio="${deviceName}"`;
      case 'Darwin':
        return `-f avfoundation -i ":${deviceName}"`;
      case 'Linux':
        return '-f pulse -i default';
      default:
        return '';
    }
  }
  
  static getCameraOverlay(position) {
    const positions = {
      'bottom-right': 'overlay=W-w-10:H-h-10',
      'bottom-left': 'overlay=10:H-h-10',
      'top-right': 'overlay=W-w-10:10',
      'top-left': 'overlay=10:10'
    };
    
    return `[1:v]scale=200:200[pip];[0:v][pip]${positions[position]}`;
  }
  
  static getQualitySettings(quality) {
    const settings = {
      'low': '-c:v libx264 -preset ultrafast -crf 28 -r 15 -s 1280x720',
      'medium': '-c:v libx264 -preset fast -crf 23 -r 30 -s 1920x1080',
      'high': '-c:v libx264 -preset medium -crf 18 -r 60 -s 1920x1080',
      'ultra': '-c:v libx264 -preset slow -crf 16 -r 30 -s 3840x2160'
    };
    
    return settings[quality] || settings['medium'];
  }
  
  static async stopRecording() {
    if (this.recordingProcess) {
      try {
        // Send 'q' to FFmpeg to stop gracefully
        await Neutralino.os.updateSpawnedProcess(
          this.recordingProcess.id, 
          'stdIn', 
          'q'
        );
        
        // Wait a bit for FFmpeg to finish
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // If still running, force kill
        await Neutralino.os.updateSpawnedProcess(
          this.recordingProcess.id,
          'exit'
        );
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
      
      this.recordingProcess = null;
    }
  }
  
  static async getRecordingDevices() {
    const devices = {
      cameras: [],
      microphones: []
    };
    
    try {
      if (this.platform === 'Windows') {
        // List DirectShow devices
        const result = await Neutralino.os.execCommand(
          `${this.ffmpegPath} -list_devices true -f dshow -i dummy`
        );
        
        // Parse output for devices
        const lines = result.stdErr.split('\n');
        let isVideo = false;
        let isAudio = false;
        
        lines.forEach(line => {
          if (line.includes('DirectShow video devices')) {
            isVideo = true;
            isAudio = false;
          } else if (line.includes('DirectShow audio devices')) {
            isVideo = false;
            isAudio = true;
          } else if (line.includes('"') && (isVideo || isAudio)) {
            const match = line.match(/"([^"]+)"/);
            if (match) {
              if (isVideo) {
                devices.cameras.push(match[1]);
              } else if (isAudio) {
                devices.microphones.push(match[1]);
              }
            }
          }
        });
      } else if (this.platform === 'Darwin') {
        // List AVFoundation devices
        const result = await Neutralino.os.execCommand(
          `${this.ffmpegPath} -f avfoundation -list_devices true -i ""`
        );
        
        // Parse macOS devices
        const lines = result.stdErr.split('\n');
        lines.forEach(line => {
          if (line.includes('AVFoundation video devices')) {
            // Parse video devices
          } else if (line.includes('AVFoundation audio devices')) {
            // Parse audio devices
          }
        });
      }
    } catch (error) {
      console.error('Error getting devices:', error);
    }
    
    return devices;
  }
}

// Export for use in other modules
window.Recorder = Recorder;
```

### camera.js - Webcam Management
```javascript
class CameraManager {
  static stream = null;
  static devices = [];
  static currentDeviceId = null;
  
  static async initialize() {
    try {
      // Request permission first
      await this.requestPermission();
      
      // Get available devices
      await this.refreshDevices();
      
      // Populate camera selector
      this.populateDeviceSelector();
      
    } catch (error) {
      console.error('Camera initialization error:', error);
    }
  }
  
  static async requestPermission() {
    try {
      // Request camera permission with a temporary stream
      const tempStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      // Stop the temporary stream
      tempStream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }
  
  static async refreshDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices.filter(device => device.kind === 'videoinput');
      
      // Also get audio devices
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      this.populateAudioDevices(audioDevices);
      
    } catch (error) {
      console.error('Error enumerating devices:', error);
      this.devices = [];
    }
  }
  
  static populateDeviceSelector() {
    const selector = document.getElementById('cameraSelect');
    selector.innerHTML = '<option value="">No Camera</option>';
    
    this.devices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Camera ${device.deviceId.substr(0, 5)}`;
      selector.appendChild(option);
    });
    
    // Select first camera by default if available
    if (this.devices.length > 0) {
      selector.value = this.devices[0].deviceId;
      this.startPreview(this.devices[0].deviceId);
    }
  }
  
  static populateAudioDevices(devices) {
    const selector = document.getElementById('micSelect');
    selector.innerHTML = '<option value="">No Microphone</option>';
    
    devices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Microphone ${device.deviceId.substr(0, 5)}`;
      selector.appendChild(option);
    });
    
    // Select first microphone by default
    if (devices.length > 0) {
      selector.value = devices[0].deviceId;
    }
  }
  
  static async startPreview(deviceId = null) {
    try {
      // Stop existing stream
      this.stopPreview();
      
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      };
      
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.currentDeviceId = deviceId;
      
      // Display in preview
      const video = document.getElementById('previewVideo');
      video.srcObject = this.stream;
      
      // Show preview, hide placeholder
      document.querySelector('.camera-preview').classList.add('active');
      
    } catch (error) {
      console.error('Error starting camera preview:', error);
      this.handleCameraError(error);
    }
  }
  
  static stopPreview() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      
      const video = document.getElementById('previewVideo');
      video.srcObject = null;
      
      document.querySelector('.camera-preview').classList.remove('active');
    }
  }
  
  static async switchCamera(deviceId) {
    if (deviceId) {
      await this.startPreview(deviceId);
    } else {
      this.stopPreview();
    }
  }
  
  static handleCameraError(error) {
    let message = 'Camera error: ';
    
    if (error.name === 'NotAllowedError') {
      message += 'Camera permission denied';
    } else if (error.name === 'NotFoundError') {
      message += 'No camera found';
    } else if (error.name === 'NotReadableError') {
      message += 'Camera is already in use';
    } else {
      message += error.message;
    }
    
    console.error(message);
    
    // Update UI to show error
    const preview = document.querySelector('.preview-placeholder span');
    preview.textContent = message;
  }
  
  static getDeviceLabel(deviceId) {
    const device = this.devices.find(d => d.deviceId === deviceId);
    return device ? device.label : 'Unknown Device';
  }
}

window.CameraManager = CameraManager;
```

### editor.js - Video Editing Functions
```javascript
class VideoEditor {
  static trimStart = 0;
  static trimEnd = 100;
  static videoDuration = 0;
  
  static initialize(videoPath) {
    const video = document.getElementById('reviewVideo');
    
    video.addEventListener('loadedmetadata', () => {
      this.videoDuration = video.duration;
      this.setupTrimControls();
    });
    
    video.addEventListener('error', (e) => {
      console.error('Video loading error:', e);
    });
  }
  
  static setupTrimControls() {
    const trimStartSlider = document.getElementById('trimStart');
    const trimEndSlider = document.getElementById('trimEnd');
    
    trimStartSlider.addEventListener('input', (e) => {
      this.trimStart = parseInt(e.target.value);
      this.updateTrimDisplay();
      this.previewTrim();
    });
    
    trimEndSlider.addEventListener('input', (e) => {
      this.trimEnd = parseInt(e.target.value);
      this.updateTrimDisplay();
      this.previewTrim();
    });
    
    this.updateTrimDisplay();
  }
  
  static updateTrimDisplay() {
    const startTime = (this.trimStart / 100) * this.videoDuration;
    const endTime = (this.trimEnd / 100) * this.videoDuration;
    
    document.getElementById('trimStartTime').textContent = this.formatTime(startTime);
    document.getElementById('trimEndTime').textContent = this.formatTime(endTime);
  }
  
  static formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  static previewTrim() {
    const video = document.getElementById('reviewVideo');
    const startTime = (this.trimStart / 100) * this.videoDuration;
    
    if (video.currentTime < startTime) {
      video.currentTime = startTime;
    }
  }
  
  static async applyTrim(inputPath, outputPath) {
    if (this.trimStart === 0 && this.trimEnd === 100) {
      // No trim needed
      return inputPath;
    }
    
    const startTime = (this.trimStart / 100) * this.videoDuration;
    const endTime = (this.trimEnd / 100) * this.videoDuration;
    const duration = endTime - startTime;
    
    const ffmpegPath = Recorder.ffmpegPath;
    const command = `${ffmpegPath} -i "${inputPath}" -ss ${startTime} -t ${duration} -c copy "${outputPath}"`;
    
    try {
      const result = await Neutralino.os.execCommand(command);
      if (result.exitCode === 0) {
        return outputPath;
      } else {
        throw new Error('Trim failed');
      }
    } catch (error) {
      console.error('Trim error:', error);
      return inputPath;
    }
  }
}

window.VideoEditor = VideoEditor;
```

### storage.js - Settings and File Management
```javascript
class StorageManager {
  static SETTINGS_KEY = 'loomlite_settings';
  static DEFAULT_SETTINGS = {
    quality: 'medium',
    format: 'mp4',
    saveLocation: null,
    cameraPosition: 'bottom-right',
    autoMinimize: true,
    showTimer: true
  };
  
  static async loadSettings() {
    try {
      const stored = await Neutralino.storage.getData(this.SETTINGS_KEY);
      return { ...this.DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      // First run or no settings saved
      return this.DEFAULT_SETTINGS;
    }
  }
  
  static async saveSettings(settings) {
    try {
      await Neutralino.storage.setData(
        this.SETTINGS_KEY, 
        JSON.stringify(settings)
      );
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }
  
  static async getDefaultSaveLocation() {
    try {
      const homeDir = await Neutralino.os.getPath('documents');
      const saveDir = `${homeDir}/LoomLite Recordings`;
      
      // Create directory if it doesn't exist
      try {
        await Neutralino.filesystem.createDirectory(saveDir);
      } catch {
        // Directory might already exist
      }
      
      return saveDir;
    } catch (error) {
      console.error('Error getting save location:', error);
      return './recordings';
    }
  }
  
  static async ensureTempDirectory() {
    try {
      await Neutralino.filesystem.createDirectory('./temp');
    } catch {
      // Directory might already exist
    }
  }
  
  static async cleanupTempFiles() {
    try {
      const entries = await Neutralino.filesystem.readDirectory('./temp');
      
      for (const entry of entries) {
        if (entry.type === 'FILE' && entry.name.startsWith('recording_')) {
          try {
            await Neutralino.filesystem.removeFile(`./temp/${entry.name}`);
          } catch {
            // Ignore errors for individual files
          }
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
  
  static generateFileName(format = 'mp4') {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `Recording_${timestamp}.${format}`;
  }
}

window.StorageManager = StorageManager;
```

## CSS Styling

### styles.css
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  height: 100vh;
  overflow: hidden;
}

#app {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view {
  display: none;
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

.view.active {
  display: block;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2, .header h3 {
  color: #667eea;
  font-size: 24px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: #f0f0f0;
}

/* Camera Preview */
.camera-preview {
  width: 100%;
  height: 200px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.camera-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: none;
}

.camera-preview.active video {
  display: block;
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.camera-preview.active .preview-placeholder {
  display: none;
}

/* Options */
.options-group {
  margin-bottom: 20px;
}

.option {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
}

.option input[type="checkbox"] {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.option span {
  font-size: 14px;
  color: #555;
}

/* Device Selection */
.device-selection {
  margin-bottom: 20px;
}

.device-select {
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.device-select:focus {
  outline: none;
  border-color: #667eea;
}

/* Record Button */
.record-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.record-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 87, 108, 0.4);
}

.record-button:active {
  transform: translateY(0);
}

.record-icon {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  display: inline-block;
}

/* Recording State */
.recording-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.recording-dot {
  width: 12px;
  height: 12px;
  background: #f5576c;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.timer {
  font-size: 48px;
  font-weight: 300;
  text-align: center;
  color: #667eea;
  margin-bottom: 24px;
  font-variant-numeric: tabular-nums;
}

.recording-controls {
  display: flex;
  gap: 12px;
}

.control-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #f5f5f5;
}

.control-btn.stop {
  background: #f5576c;
  color: white;
  border-color: #f5576c;
}

.control-btn.stop:hover {
  background: #e04560;
}

/* Review View */
#reviewVideo {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 16px;
}

.trim-controls {
  margin-bottom: 20px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.trim-controls input[type="range"] {
  width: 100%;
  margin-bottom: 8px;
}

.trim-info {
  text-align: center;
  font-size: 14px;
  color: #666;
}

/* Review Actions */
.review-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.primary-btn, .secondary-btn, .danger-btn {
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn {
  background: #667eea;
  color: white;
  grid-column: span 2;
}

.primary-btn:hover {
  background: #5a67d8;
}

.secondary-btn {
  background: #f0f0f0;
  color: #333;
}

.secondary-btn:hover {
  background: #e0e0e0;
}

.danger-btn {
  background: #f56565;
  color: white;
}

.danger-btn:hover {
  background: #e53e3e;
}

/* Settings */
.settings-content {
  max-height: 400px;
  overflow-y: auto;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group h4 {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.setting-group select,
.setting-group input[type="text"] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.setting-group button {
  margin-top: 8px;
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Hotkey Info */
.hotkey-info {
  text-align: center;
  margin-top: 16px;
  font-size: 12px;
  color: #999;
}

kbd {
  padding: 2px 6px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-family: monospace;
  font-size: 11px;
}

/* Minimize Hint */
.minimize-hint {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #999;
}
```

## Build Configuration

### package.json (for development)
```json
{
  "name": "loom-lite",
  "version": "1.0.0",
  "description": "Lightweight screen recorder with webcam overlay",
  "scripts": {
    "dev": "neu run",
    "build": "neu build",
    "dist-win": "neu build --release && node scripts/package-win.js",
    "dist-mac": "neu build --release && node scripts/package-mac.js",
    "dist-linux": "neu build --release && node scripts/package-linux.js"
  },
  "keywords": ["screen-recorder", "loom", "neutralino"],
  "author": "Your Name",
  "license": "MIT"
}
```

## FFmpeg Minimal Build Script

### scripts/build-ffmpeg.sh
```bash
#!/bin/bash

# Minimal FFmpeg build for screen recording
# Reduces size from ~70MB to ~15MB

./configure \
  --prefix="./build" \
  --disable-everything \
  --disable-network \
  --disable-autodetect \
  --enable-small \
  --enable-gpl \
  --enable-libx264 \
  --enable-encoder=aac \
  --enable-encoder=libx264 \
  --enable-decoder=h264 \
  --enable-decoder=aac \
  --enable-demuxer=mov,mp4,matroska \
  --enable-muxer=mp4,matroska \
  --enable-protocol=file,pipe \
  --enable-filter=scale,overlay,aresample \
  --enable-indev=gdigrab,dshow \
  --enable-indev=avfoundation \
  --enable-indev=x11grab,v4l2,pulse \
  --disable-doc \
  --disable-debug

make -j$(nproc)
make install

# Strip symbols to reduce size further
strip build/bin/ffmpeg

echo "FFmpeg built successfully!"
echo "Size: $(du -sh build/bin/ffmpeg)"
```

## Testing Checklist

### Core Functionality
- [ ] Screen recording works on all platforms
- [ ] Webcam overlay displays correctly
- [ ] Audio recording captures properly
- [ ] Hotkeys trigger recording
- [ ] System tray minimization works
- [ ] Video saves to correct location
- [ ] Trim functionality works

### Platform-Specific
- [ ] Windows: Admin rights not required
- [ ] Windows: Works with high DPI displays
- [ ] macOS: Screen recording permission requested
- [ ] macOS: Works on both Intel and M1
- [ ] Linux: Works on X11
- [ ] Linux: Works on Wayland

### Edge Cases
- [ ] No camera available
- [ ] No microphone available
- [ ] Disk space runs out
- [ ] FFmpeg crashes mid-recording
- [ ] User switches display during recording