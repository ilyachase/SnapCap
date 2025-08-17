class Recorder {
  static ffmpegPath = null;
  static recordingProcess = null;
  static platform = null;
  static isRecording = false;
  
  static async initialize() {
    console.log('Initializing recorder...');
    
    try {
      this.platform = await this.getPlatform();
      console.log(`Platform detected: ${this.platform}`);
      
      this.ffmpegPath = await this.getFFmpegPath();
      console.log(`FFmpeg path: ${this.ffmpegPath}`);
      
      // Verify FFmpeg exists
      const exists = await this.verifyFFmpeg();
      if (!exists) {
        throw new Error('FFmpeg not found. Please ensure FFmpeg is in the ffmpeg folder.');
      }
      
      // Ensure temp directory exists
      await StorageManager.ensureTempDirectory();
      
      console.log('Recorder initialized successfully');
    } catch (error) {
      console.error('Recorder initialization failed:', error);
      throw error;
    }
  }
  
  static async getPlatform() {
    try {
      const envInfo = await Neutralino.os.getEnv('OS');
      if (envInfo) {
        return 'Windows';
      }
      
      // Try other methods
      const osInfo = await Neutralino.computer.getOSInfo();
      return osInfo.name;
    } catch {
      // Fallback detection
      if (navigator.platform.indexOf('Win') !== -1) return 'Windows';
      if (navigator.platform.indexOf('Mac') !== -1) return 'Darwin';
      return 'Linux';
    }
  }
  
  static async getFFmpegPath() {
    const basePath = await StorageManager.getAbsolutePath('resources/ffmpeg');
    
    const paths = {
      'Windows': `${basePath}\\win\\ffmpeg.exe`,
      'Darwin': `${basePath}/mac/ffmpeg`,
      'Linux': `${basePath}/linux/ffmpeg`
    };
    
    return paths[this.platform] || `${basePath}/ffmpeg`;
  }
  
  static async verifyFFmpeg() {
    try {
      console.log('Verifying FFmpeg installation...');
      const result = await Neutralino.os.execCommand(`"${this.ffmpegPath}" -version`);
      const success = result.exitCode === 0;
      
      if (success) {
        console.log('FFmpeg verification successful');
      } else {
        console.error('FFmpeg verification failed:', result.stdErr);
      }
      
      return success;
    } catch (error) {
      console.error('FFmpeg verification error:', error);
      return false;
    }
  }
  
  static async startRecording(options) {
    if (this.isRecording) {
      throw new Error('Recording is already in progress');
    }
    
    const timestamp = Date.now();
    const outputPath = await StorageManager.getAbsolutePath(`temp/recording_${timestamp}.${options.format || 'mp4'}`);
    
    console.log('Starting recording with options:', options);
    console.log('Output path:', outputPath);
    
    const command = await this.buildCommand(options, outputPath);
    console.log('FFmpeg command:', command);
    
    try {
      // Start FFmpeg process
      this.recordingProcess = await Neutralino.os.spawnProcess(command);
      this.isRecording = true;
      
      console.log('Recording started successfully');
      return outputPath;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error(`Recording failed to start: ${error.message}`);
    }
  }
  
  static async buildCommand(options, outputPath) {
    let command = `"${this.ffmpegPath}" `;
    
    // Screen capture input
    command += await this.getScreenInput() + ' ';
    
    // Camera input if enabled
    if (options.withCamera && options.cameraDevice) {
      command += await this.getCameraInput(options.cameraDevice) + ' ';
    }
    
    // Audio input if enabled
    if (options.withAudio && options.audioDevice) {
      command += await this.getAudioInput(options.audioDevice) + ' ';
    }
    
    // Video filters for camera overlay
    if (options.withCamera && options.cameraDevice) {
      const overlay = this.getCameraOverlay(options.cameraPosition || 'bottom-right');
      command += `-filter_complex "${overlay}" `;
    }
    
    // Quality settings
    const quality = this.getQualitySettings(options.quality || 'medium');
    command += `${quality} `;
    
    // Output file
    command += `-y "${outputPath}"`;
    
    return command;
  }
  
  static async getScreenInput() {
    switch (this.platform) {
      case 'Windows':
        return '-f gdigrab -framerate 30 -i desktop';
      case 'Darwin':
        return '-f avfoundation -framerate 30 -i "1:none"';
      case 'Linux':
        // Try to detect display
        try {
          const display = await Neutralino.os.getEnv('DISPLAY');
          return `-f x11grab -framerate 30 -i ${display || ':0.0'}`;
        } catch {
          return '-f x11grab -framerate 30 -i :0.0';
        }
      default:
        return '-f gdigrab -framerate 30 -i desktop';
    }
  }
  
  static async getCameraInput(deviceName) {
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
  
  static async getAudioInput(deviceName) {
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
    
    return `[1:v]scale=200:150[pip];[0:v][pip]${positions[position]}`;
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
    if (!this.isRecording || !this.recordingProcess) {
      console.log('No recording in progress');
      return;
    }
    
    try {
      console.log('Stopping recording...');
      
      // Send 'q' command to FFmpeg to stop gracefully
      try {
        await Neutralino.os.updateSpawnedProcess(
          this.recordingProcess.id, 
          'stdIn', 
          'q'
        );
        
        // Wait for FFmpeg to finish
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.warn('Failed to send quit command:', error);
      }
      
      // Force kill if still running
      try {
        await Neutralino.os.updateSpawnedProcess(
          this.recordingProcess.id,
          'exit'
        );
      } catch (error) {
        console.warn('Process may have already exited:', error);
      }
      
      this.recordingProcess = null;
      this.isRecording = false;
      
      console.log('Recording stopped successfully');
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw new Error(`Failed to stop recording: ${error.message}`);
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
          `"${this.ffmpegPath}" -list_devices true -f dshow -i dummy`
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
          `"${this.ffmpegPath}" -f avfoundation -list_devices true -i ""`
        );
        
        // Parse macOS devices
        const lines = result.stdErr.split('\n');
        lines.forEach(line => {
          // Parse video and audio devices from AVFoundation output
          if (line.includes('[') && line.includes(']') && !line.includes('devices:')) {
            const match = line.match(/\[(\d+)\] (.+)/);
            if (match) {
              const deviceName = match[2];
              if (line.toLowerCase().includes('video')) {
                devices.cameras.push(deviceName);
              } else {
                devices.microphones.push(deviceName);
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Error getting devices:', error);
    }
    
    return devices;
  }
  
  static isCurrentlyRecording() {
    return this.isRecording;
  }
  
  static async testRecording() {
    try {
      const testCommand = `"${this.ffmpegPath}" -f lavfi -i testsrc=duration=1:size=320x240:rate=1 -f null -`;
      const result = await Neutralino.os.execCommand(testCommand);
      return result.exitCode === 0;
    } catch (error) {
      console.error('Test recording failed:', error);
      return false;
    }
  }
}

window.Recorder = Recorder;
