# SnapCap - Overall Plan & Roadmap

## Project Vision
A free, cross-platform screen recording application with webcam bubble overlay, built to be as lightweight as possible while maintaining core Loom-like functionality.

## Project Goals
- **App size**: Under 30MB total
- **Performance**: Cold start < 2 seconds, recording starts < 1 second
- **Platforms**: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **Memory**: Under 100MB while recording
- **Price**: Completely free, open source

## Two-Phase Approach

### Phase 1: MVP Core Recording (Weeks 1-8)
**Goal**: Ship a working, lightweight screen recorder with camera bubble

**Core Features:**
- Screen recording with webcam bubble
- Start/stop with hotkeys (Ctrl+Shift+R)
- Save videos locally (MP4)
- Basic trim editing
- System tray integration
- Cross-platform support

**Tech Stack:**
- Neutralino.js (~2MB)
- Minimal FFmpeg (~15-20MB)
- HTML/CSS/JavaScript
- Total size: ~25MB

### Phase 2: AI Enhancement (Weeks 9-12)
**Goal**: Add optional AI features via free Groq API

**AI Features:**
- Automatic transcription
- AI-generated summaries
- Smart chapter markers
- Filler word detection
- Action items extraction

**Tech Addition:**
- Groq API integration (free tier)
- User provides their own API key
- No additional app size

## Development Roadmap

### Phase 1: MVP (8 weeks)

#### Foundation
- [ ] Set up Neutralino.js project structure
- [ ] Create basic UI with HTML/CSS
- [ ] Implement view switching logic
- [ ] Download and integrate minimal FFmpeg builds
- [ ] Test basic FFmpeg commands on each OS

#### Core Recording
- [ ] Implement screen recording with FFmpeg
- [ ] Add webcam bubble overlay
- [ ] Integrate audio recording
- [ ] Add start/stop functionality
- [ ] Implement recording timer

#### Platform-Specific Features
- [ ] Windows: Test with different display scaling
- [ ] macOS: Handle screen recording permissions
- [ ] Linux: Support both X11 and Wayland
- [ ] Add system tray integration
- [ ] Implement global hotkeys

#### Post-Recording Features
- [ ] Video preview player
- [ ] Basic trim functionality
- [ ] Save with custom filename/location
- [ ] Export settings (quality, format)

#### Polish & Testing
- [ ] Error handling and edge cases
- [ ] Performance optimization
- [ ] Memory leak testing
- [ ] Cross-platform testing
- [ ] UI/UX refinements

#### Distribution
- [ ] Build scripts for each platform
- [ ] Create installer packages
- [ ] Write documentation
- [ ] Create landing page

### Phase 2: AI Features

#### Groq Integration Setup
- [ ] Design settings UI for API keys
- [ ] Implement Groq API client
- [ ] Add audio extraction from video
- [ ] Test transcription endpoint

#### Core AI Features
- [ ] Implement automatic transcription
- [ ] Add summary generation
- [ ] Create chapter detection
- [ ] Build transcript UI viewer

#### Advanced AI Features
- [ ] Filler word detection and highlighting
- [ ] Action items extraction
- [ ] Export transcript with video
- [ ] Searchable transcript interface

#### AI Polish & Release
- [ ] Error handling for API failures
- [ ] Optimize API usage for cost
- [ ] Add AI features documentation
- [ ] Release version 2.0

### Initial Commands
```bash
# Install Neutralino CLI
npm install -g @neutralinojs/neu

# Create project
neu create loom-lite
cd loom-lite

# Run development mode
neu run

# Build for distribution
neu build
```

## Key Decisions Log

| Decision | Date | Rationale |
|----------|------|-----------|
| Use Neutralino.js over Electron | - | 10x smaller size |
| Use FFmpeg over native APIs | - | Cross-platform simplicity |
| Groq for AI over OpenAI | - | Free tier available |
| Phase 1 without AI | - | Faster MVP, prove core value |

## Resources & References

- [Neutralino.js Documentation](https://neutralino.js.org/docs/)
- [FFmpeg Compilation Guide](https://trac.ffmpeg.org/wiki/CompilationGuide)
- [Groq API Documentation](https://console.groq.com/docs)
- [Loom Feature Analysis](https://www.loom.com/features)
- [Cap.so Repository](https://github.com/cap-so/cap)