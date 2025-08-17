class StorageManager {
  static SETTINGS_KEY = 'snapcap_settings';
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
      const saveDir = `${homeDir}\\SnapCap Recordings`;
      
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
  
  static async getAbsolutePath(relativePath) {
    try {
      const appPath = await Neutralino.os.getPath('data');
      return `${appPath}\\${relativePath}`;
    } catch {
      return relativePath;
    }
  }
}

window.StorageManager = StorageManager;
