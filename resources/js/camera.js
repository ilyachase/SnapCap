class CameraManager {
  static stream = null;
  static devices = [];
  static currentDeviceId = null;
  
  static async initialize() {
    try {
      console.log('Initializing camera manager...');
      
      // Request permission first
      await this.requestPermission();
      
      // Get available devices
      await this.refreshDevices();
      
      // Populate camera selector
      this.populateDeviceSelector();
      
      console.log('Camera manager initialized');
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
      
      console.log('Camera permission granted');
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      this.handleCameraError(error);
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
      
      console.log(`Found ${this.devices.length} video devices and ${audioDevices.length} audio devices`);
      
    } catch (error) {
      console.error('Error enumerating devices:', error);
      this.devices = [];
    }
  }
  
  static populateDeviceSelector() {
    const selector = document.getElementById('cameraSelect');
    selector.innerHTML = '<option value="">No Camera</option>';
    
    this.devices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Camera ${index + 1}`;
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
    
    devices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Microphone ${index + 1}`;
      selector.appendChild(option);
    });
    
    // Select first microphone by default
    if (devices.length > 0) {
      selector.value = devices[0].deviceId;
    }
  }
  
  static async startPreview(deviceId = null) {
    try {
      console.log('Starting camera preview...');
      
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
      
      console.log('Camera preview started');
      
    } catch (error) {
      console.error('Error starting camera preview:', error);
      this.handleCameraError(error);
    }
  }
  
  static stopPreview() {
    if (this.stream) {
      console.log('Stopping camera preview...');
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
      message += 'Camera permission denied. Please allow camera access in your browser settings.';
    } else if (error.name === 'NotFoundError') {
      message += 'No camera found. Please connect a camera and try again.';
    } else if (error.name === 'NotReadableError') {
      message += 'Camera is already in use by another application.';
    } else if (error.name === 'OverconstrainedError') {
      message += 'Camera does not support the requested settings.';
    } else {
      message += error.message || 'Unknown camera error occurred.';
    }
    
    console.error(message);
    
    // Update UI to show error
    const preview = document.querySelector('.preview-placeholder span');
    if (preview) {
      preview.textContent = message;
    }
  }
  
  static getDeviceLabel(deviceId) {
    const device = this.devices.find(d => d.deviceId === deviceId);
    return device ? (device.label || 'Unknown Camera') : 'Unknown Device';
  }
  
  static getCurrentStream() {
    return this.stream;
  }
  
  static async testCamera(deviceId) {
    try {
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined
        },
        audio: false
      };
      
      const testStream = await navigator.mediaDevices.getUserMedia(constraints);
      testStream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera test failed:', error);
      return false;
    }
  }
}

window.CameraManager = CameraManager;
