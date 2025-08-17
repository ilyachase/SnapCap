# FFmpeg Download Instructions

This application requires FFmpeg static binaries for each platform.

## Download Links

### Windows
- **URL:** https://www.gyan.dev/ffmpeg/builds/
- **File:** Download "essentials" build
- **Location:** Extract `ffmpeg.exe` to `resources/ffmpeg/win/ffmpeg.exe`
- **Size:** ~50MB

### macOS  
- **URL:** https://evermeet.cx/ffmpeg/
- **File:** Download static build
- **Location:** Extract to `resources/ffmpeg/mac/ffmpeg`
- **Permissions:** Run `chmod +x resources/ffmpeg/mac/ffmpeg`

### Linux
- **URL:** https://johnvansickle.com/ffmpeg/
- **File:** Download amd64 static build
- **Location:** Extract to `resources/ffmpeg/linux/ffmpeg`  
- **Permissions:** Run `chmod +x resources/ffmpeg/linux/ffmpeg`

## Why FFmpeg is Required

FFmpeg handles:
- Screen recording
- Webcam capture
- Audio recording
- Video encoding (H.264)
- Video trimming/editing

## Security Note

Always download FFmpeg from official sources listed above. Verify checksums when available for production use.

## Testing Installation

After downloading, test with:
```bash
# Windows
resources/ffmpeg/win/ffmpeg.exe -version

# macOS/Linux  
./resources/ffmpeg/mac/ffmpeg -version
./resources/ffmpeg/linux/ffmpeg -version
```

You should see FFmpeg version information if installed correctly.
