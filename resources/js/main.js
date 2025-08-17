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
    console.log('Initializing SnapCap...');
    
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
  document.getElementById('saveAsBtn').addEventListener('click', saveRecordingAs);
  document.getElementById('discardBtn').addEventListener('click', discardRecording);
  document.getElementById('recordAgainBtn').addEventListener('click', () => {
    discardRecording();
    ViewManager.showView('main');
  });
  
  // Settings
  document.getElementById('browseSaveLocation').addEventListener('click', browseSaveLocation);
  
  // Settings changes
  document.getElementById('qualitySelect').addEventListener('change', saveSettings);
  document.getElementById('formatSelect').addEventListener('change', saveSettings);
  document.getElementById('cameraPosition').addEventListener('change', saveSettings);
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
      format: AppState.settings.format || 'mp4',
      cameraPosition: AppState.settings.cameraPosition || 'bottom-right'
    };
    
    AppState.recordingPath = await Recorder.startRecording(options);
    AppState.isRecording = true;
    
    ViewManager.showView('recording');
    startTimer();
    
    // Minimize to tray after 2 seconds
    setTimeout(() => {
      if (AppState.settings.autoMinimize !== false) {
        Neutralino.window.minimize();
      }
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
    document.getElementById('reviewVideo').src = `file://${AppState.recordingPath}`;
    VideoEditor.initialize();
    
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
  try {
    const platform = await Neutralino.os.getEnv('OS');
    
    // For now, use document-level listeners
    // In a production app, you'd want proper global hotkeys
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        toggleRecording();
      }
    });
    
    console.log('Hotkey registered (Ctrl/Cmd+Shift+R)');
  } catch (error) {
    console.error('Failed to register hotkey:', error);
  }
}

// System tray setup
async function setupSystemTray() {
  // Neutralino doesn't have built-in tray support
  // This is a placeholder for future extension
  console.log('System tray setup placeholder');
}

// Save recording
async function saveRecording() {
  try {
    const defaultName = StorageManager.generateFileName(AppState.settings.format || 'mp4');
    const saveLocation = AppState.settings.saveLocation || await StorageManager.getDefaultSaveLocation();
    const defaultPath = `${saveLocation}/${defaultName}`;
    
    // Apply trim if needed
    const finalPath = await VideoEditor.applyTrim(AppState.recordingPath, `${AppState.recordingPath}_trimmed.${AppState.settings.format || 'mp4'}`);
    
    // Copy to final location
    await Neutralino.filesystem.copyFile(finalPath, defaultPath);
    
    await Neutralino.os.showMessageBox('Success', 'Recording saved successfully!');
    ViewManager.showView('main');
    
    // Cleanup temp files
    StorageManager.cleanupTempFiles();
  } catch (error) {
    console.error('Failed to save recording:', error);
    await Neutralino.os.showMessageBox('Error', `Failed to save recording: ${error.message}`);
  }
}

// Save recording with custom location
async function saveRecordingAs() {
  try {
    const savePath = await Neutralino.os.showSaveDialog('Save Recording', {
      defaultPath: StorageManager.generateFileName(AppState.settings.format || 'mp4'),
      filters: [
        {name: 'Video Files', extensions: ['mp4', 'webm', 'mkv']}
      ]
    });
    
    if (savePath) {
      // Apply trim if needed
      const finalPath = await VideoEditor.applyTrim(AppState.recordingPath, `${AppState.recordingPath}_trimmed.${AppState.settings.format || 'mp4'}`);
      
      await Neutralino.filesystem.copyFile(finalPath, savePath);
      await Neutralino.os.showMessageBox('Success', 'Recording saved successfully!');
      ViewManager.showView('main');
      
      // Cleanup temp files
      StorageManager.cleanupTempFiles();
    }
  } catch (error) {
    console.error('Failed to save recording:', error);
    await Neutralino.os.showMessageBox('Error', `Failed to save recording: ${error.message}`);
  }
}

// Discard recording
async function discardRecording() {
  try {
    if (AppState.recordingPath) {
      await Neutralino.filesystem.removeFile(AppState.recordingPath);
    }
    AppState.recordingPath = null;
    ViewManager.showView('main');
  } catch (error) {
    console.error('Failed to discard recording:', error);
  }
}

// Browse save location
async function browseSaveLocation() {
  try {
    const folderPath = await Neutralino.os.showFolderDialog('Select Save Location');
    if (folderPath) {
      document.getElementById('saveLocation').value = folderPath;
      AppState.settings.saveLocation = folderPath;
      await StorageManager.saveSettings(AppState.settings);
    }
  } catch (error) {
    console.error('Failed to browse save location:', error);
  }
}

// Save settings
async function saveSettings() {
  AppState.settings.quality = document.getElementById('qualitySelect').value;
  AppState.settings.format = document.getElementById('formatSelect').value;
  AppState.settings.cameraPosition = document.getElementById('cameraPosition').value;
  
  await StorageManager.saveSettings(AppState.settings);
}

// Load settings into UI
function loadSettingsIntoUI() {
  document.getElementById('qualitySelect').value = AppState.settings.quality || 'medium';
  document.getElementById('formatSelect').value = AppState.settings.format || 'mp4';
  document.getElementById('cameraPosition').value = AppState.settings.cameraPosition || 'bottom-right';
  document.getElementById('saveLocation').value = AppState.settings.saveLocation || '';
}

// Initialize when ready
Neutralino.events.on('ready', () => {
  initializeApp().then(() => {
    loadSettingsIntoUI();
  });
});

Neutralino.events.on('windowClose', () => {
  if (AppState.isRecording) {
    stopRecording().then(() => {
      Neutralino.app.exit();
    });
  } else {
    Neutralino.app.exit();
  }
});
