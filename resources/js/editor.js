class VideoEditor {
  static trimStart = 0;
  static trimEnd = 100;
  static videoDuration = 0;
  
  static initialize() {
    console.log('Initializing video editor...');
    const video = document.getElementById('reviewVideo');
    
    video.addEventListener('loadedmetadata', () => {
      this.videoDuration = video.duration;
      this.setupTrimControls();
      console.log(`Video loaded: ${this.videoDuration}s duration`);
    });
    
    video.addEventListener('error', (e) => {
      console.error('Video loading error:', e);
    });
    
    video.addEventListener('canplay', () => {
      this.updateTrimDisplay();
    });
  }
  
  static setupTrimControls() {
    const trimStartSlider = document.getElementById('trimStart');
    const trimEndSlider = document.getElementById('trimEnd');
    
    // Reset sliders
    trimStartSlider.value = 0;
    trimEndSlider.value = 100;
    this.trimStart = 0;
    this.trimEnd = 100;
    
    trimStartSlider.addEventListener('input', (e) => {
      this.trimStart = parseInt(e.target.value);
      
      // Ensure start is before end
      if (this.trimStart >= this.trimEnd) {
        this.trimStart = this.trimEnd - 1;
        trimStartSlider.value = this.trimStart;
      }
      
      this.updateTrimDisplay();
      this.previewTrim();
    });
    
    trimEndSlider.addEventListener('input', (e) => {
      this.trimEnd = parseInt(e.target.value);
      
      // Ensure end is after start
      if (this.trimEnd <= this.trimStart) {
        this.trimEnd = this.trimStart + 1;
        trimEndSlider.value = this.trimEnd;
      }
      
      this.updateTrimDisplay();
      this.previewTrim();
    });
    
    this.updateTrimDisplay();
  }
  
  static updateTrimDisplay() {
    if (this.videoDuration === 0) return;
    
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
    if (!video || this.videoDuration === 0) return;
    
    const startTime = (this.trimStart / 100) * this.videoDuration;
    const endTime = (this.trimEnd / 100) * this.videoDuration;
    
    // Set video bounds
    if (video.currentTime < startTime || video.currentTime > endTime) {
      video.currentTime = startTime;
    }
    
    // Add event listener to loop within trim bounds
    video.ontimeupdate = () => {
      if (video.currentTime > endTime) {
        video.currentTime = startTime;
        video.pause();
      }
    };
  }
  
  static async applyTrim(inputPath, outputPath) {
    if (this.trimStart === 0 && this.trimEnd === 100) {
      // No trim needed
      console.log('No trimming required');
      return inputPath;
    }
    
    const startTime = (this.trimStart / 100) * this.videoDuration;
    const endTime = (this.trimEnd / 100) * this.videoDuration;
    const duration = endTime - startTime;
    
    console.log(`Trimming video: ${startTime}s to ${endTime}s (${duration}s duration)`);
    
    const ffmpegPath = await Recorder.getFFmpegPath();
    const command = `"${ffmpegPath}" -i "${inputPath}" -ss ${startTime} -t ${duration} -c copy "${outputPath}"`;
    
    try {
      const result = await Neutralino.os.execCommand(command);
      if (result.exitCode === 0) {
        console.log('Video trimmed successfully');
        return outputPath;
      } else {
        console.error('Trim failed:', result.stdErr);
        throw new Error('Trim operation failed');
      }
    } catch (error) {
      console.error('Trim error:', error);
      // Return original if trim fails
      return inputPath;
    }
  }
  
  static getTrimInfo() {
    return {
      startPercent: this.trimStart,
      endPercent: this.trimEnd,
      startTime: (this.trimStart / 100) * this.videoDuration,
      endTime: (this.trimEnd / 100) * this.videoDuration,
      duration: ((this.trimEnd - this.trimStart) / 100) * this.videoDuration,
      needsTrim: this.trimStart !== 0 || this.trimEnd !== 100
    };
  }
  
  static reset() {
    this.trimStart = 0;
    this.trimEnd = 100;
    this.videoDuration = 0;
    
    const video = document.getElementById('reviewVideo');
    if (video) {
      video.ontimeupdate = null;
    }
  }
  
  static async validateVideo(videoPath) {
    try {
      const ffmpegPath = await Recorder.getFFmpegPath();
      const command = `"${ffmpegPath}" -i "${videoPath}" -f null -`;
      const result = await Neutralino.os.execCommand(command);
      return result.exitCode === 0;
    } catch (error) {
      console.error('Video validation error:', error);
      return false;
    }
  }
}

window.VideoEditor = VideoEditor;
