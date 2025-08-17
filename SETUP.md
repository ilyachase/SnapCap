# Setup Instructions for SnapCap

## Prerequisites

### 1. Install Neutralino.js CLI

```bash
npm install -g @neutralinojs/neu
```

### 2. Download Required Files

#### Neutralino.js Setup
The client library and runtime binaries are automatically downloaded when you run:
```bash
npx neu update
```
This creates `resources/js/neutralino.js`, `resources/js/neutralino.d.ts`, and the `bin/` directory.

#### FFmpeg Binaries
You need to download FFmpeg static binaries for each platform you want to support:

**Windows:**
1. Go to https://www.gyan.dev/ffmpeg/builds/
2. Download the "essentials" build (smaller size, ~50MB instead of ~200MB)
3. Extract `ffmpeg.exe` to `resources/ffmpeg/win/ffmpeg.exe`

**macOS:**
1. Go to https://evermeet.cx/ffmpeg/
2. Download the static build
3. Extract `ffmpeg` to `resources/ffmpeg/mac/ffmpeg`
4. Make executable: `chmod +x resources/ffmpeg/mac/ffmpeg`

**Linux:**
1. Go to https://johnvansickle.com/ffmpeg/
2. Download the static build for your architecture (usually amd64)
3. Extract `ffmpeg` to `resources/ffmpeg/linux/ffmpeg`
4. Make executable: `chmod +x resources/ffmpeg/linux/ffmpeg`

## Quick Start

### Option 1: Use Existing Neutralino Project
If you already have this project set up:

```bash
# Run the development version
neu run

# Build for production
neu build --release
```

### Option 2: Create New Neutralino Project
```bash
# Create new project
neu create snapcap --template vanilla

# Copy project files (overwrite generated files)
# Then run:
neu run
```

## FFmpeg Setup Verification

Test your FFmpeg installation:

```bash
# Windows
resources/ffmpeg/win/ffmpeg.exe -version

# macOS/Linux
./resources/ffmpeg/mac/ffmpeg -version
./resources/ffmpeg/linux/ffmpeg -version
```

## Building for Production

### Windows
```bash
neu build --release
# Output: dist/snapcap/
```

### macOS
```bash
neu build --release
# Output: dist/snapcap/
```

### Linux
```bash
neu build --release
# Output: dist/snapcap/
```

## Directory Structure
```
snapcap/
├── resources/
│   ├── index.html          # Main UI
│   ├── css/
│   │   └── styles.css      # Styling
│   ├── js/
│   │   ├── neutralino.js   # Download from GitHub
│   │   ├── main.js         # App entry point
│   │   ├── recorder.js     # Recording logic
│   │   ├── camera.js       # Camera management
│   │   ├── editor.js       # Video editing
│   │   └── storage.js      # Settings storage
│   └── ffmpeg/             # Platform-specific FFmpeg binaries
│       ├── win/ffmpeg.exe
│       ├── mac/ffmpeg
│       └── linux/ffmpeg
├── temp/                   # Temporary files
├── neutralino.config.json  # Configuration
├── package.json           # Project metadata
└── SETUP.md               # This file
```

## Troubleshooting

### Common Issues

**"FFmpeg not found" error:**
- Verify FFmpeg binary is in the correct path
- Check file permissions (must be executable)
- Test manually: `ffmpeg -version`

**Camera not working:**
- Grant browser permission for camera access
- Check if camera is being used by another application
- Try different browsers (Chrome/Edge work best)

**Recording fails:**
- Check available disk space
- Verify FFmpeg has proper permissions
- On macOS: Grant screen recording permission in System Preferences

**Audio not recording:**
- Grant microphone permissions
- Check system audio settings
- For system audio: May require additional setup

### Performance Tips

1. **Lower quality for better performance:**
   - Use "Low" or "Medium" quality for slower computers
   - Higher quality requires more CPU/disk resources

2. **Close unnecessary applications:**
   - Other video/audio apps can interfere
   - Free up system resources

3. **Sufficient disk space:**
   - Videos can be large (1GB+ for longer recordings)
   - Monitor temp folder space

## Development

### Testing the App
1. Start with `neu run`
2. Test camera preview first
3. Try short recording (10-15 seconds)
4. Test video review and trimming
5. Verify save functionality

### Debugging
- Open browser DevTools (F12)
- Check console for JavaScript errors
- Monitor Network tab for failed requests
- Use Neutralino logs for native errors

## Production Deployment

### Windows
1. Build: `neu build --release`
2. Bundle FFmpeg binary with the app
3. Create installer using NSIS or similar
4. Test on clean Windows machine

### macOS
1. Build: `neu build --release`
2. Code sign the application (for distribution)
3. Create DMG installer
4. Test screen recording permissions

### Linux
1. Build: `neu build --release`
2. Package as AppImage, .deb, or .rpm
3. Include FFmpeg binary
4. Test on different distributions

## Security Notes

- FFmpeg binaries should be verified before distribution
- Screen recording requires user permission
- Temporary files are cleaned up automatically
- No data is sent to external servers (fully offline)