# SnapCap - Overall Plan & Roadmap

## Project Vision 🎯
🚀 **SnapCap** is the lightning-fast, featherweight screen recorder that puts the power back in your hands! 

Imagine having all the magic of premium screen recording tools - webcam bubbles, crisp recordings, smart editing - but without the bloat, subscriptions, or privacy concerns. That's SnapCap: a blazingly fast, completely free alternative that respects your time, storage, and wallet.

✨ **Why settle for heavy when you can have mighty?** At under 30MB, SnapCap starts faster than you can say "record" and captures your screen with the quality you deserve.

## Project Goals 🎯
- 📦 **Ultra-compact**: Under 30MB total (smaller than most photos!)
- ⚡ **Lightning performance**: Cold start < 2 seconds, recording starts < 1 second
- 🌍 **Cross-platform champion**: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- 🧠 **Memory efficient**: Under 100MB while recording (your RAM will thank you)
- 💝 **Forever free**: Completely free, open source, no strings attached

## Two-Phase Launch Strategy 🚀

### Phase 1: MVP Core Recording 🎬
**Mission**: Deliver a rock-solid, blazing-fast screen recorder that just works!

**Core Features:**
- 📹 Screen recording with stylish webcam bubble
- ⌨️ Lightning hotkeys (Ctrl+Shift+R to rule them all!)
- 💾 Save videos locally in crisp MP4 format
- ✂️ Smart trim editing (cut the boring parts)
- 🔔 Ninja-mode system tray integration
- 🌐 True cross-platform freedom

**Tech Stack:** ⚙️
- 🪶 Neutralino.js (~2MB) - The lightweight champion
- 🎞️ Minimal FFmpeg (~15-20MB) - Industry-grade video magic
- 🌐 HTML/CSS/JavaScript - Clean, fast, reliable
- 🏆 **Total size: ~25MB** (That's smaller than most apps' splash screens!)

### Phase 2: AI Superpower Unleashed 🧠✨
**Mission**: Transform your recordings into intelligent, searchable content with cutting-edge AI!

**AI Features:**
- 🎤 Automatic transcription (say goodbye to manual typing!)
- 📝 AI-generated summaries (get the gist instantly)
- 📚 Smart chapter markers (navigate like a pro)
- 🗣️ Filler word detection (clean up those "ums" and "ahs")
- ✅ Action items extraction (never miss a follow-up again)

**Tech Addition:** 🔧
- 🚀 Groq API integration (blazing-fast, free tier included!)
- 🔑 Bring your own API key (your data, your control)
- 🎁 **Zero bloat** - No additional app size whatsoever!

## Development Roadmap 🗺️

### Phase 1: Building the Foundation 🏗️

#### 🏗️ Foundation
- [ ] Set up Neutralino.js project structure
- [ ] Create basic UI with HTML/CSS
- [ ] Implement view switching logic
- [ ] Download and integrate minimal FFmpeg builds
- [ ] Test basic FFmpeg commands on each OS

#### 🎬 Core Recording Engine
- [ ] Implement screen recording with FFmpeg
- [ ] Add webcam bubble overlay
- [ ] Integrate audio recording
- [ ] Add start/stop functionality
- [ ] Implement recording timer

#### 🌍 Platform-Specific Features
- [ ] Windows: Test with different display scaling
- [ ] macOS: Handle screen recording permissions
- [ ] Linux: Support both X11 and Wayland
- [ ] Add system tray integration
- [ ] Implement global hotkeys

#### ✨ Post-Recording Magic
- [ ] Video preview player
- [ ] Basic trim functionality
- [ ] Save with custom filename/location
- [ ] Export settings (quality, format)

#### 🛡️ Polish & Testing
- [ ] Error handling and edge cases
- [ ] Performance optimization
- [ ] Memory leak testing
- [ ] Cross-platform testing
- [ ] UI/UX refinements

#### 📦 Distribution Ready
- [ ] Build scripts for each platform
- [ ] Create installer packages
- [ ] Write documentation
- [ ] Create landing page

### Phase 2: AI Intelligence Layer 🧠

#### 🔧 Groq Integration Setup
- [ ] Design settings UI for API keys
- [ ] Implement Groq API client
- [ ] Add audio extraction from video
- [ ] Test transcription endpoint

#### 🎯 Core AI Features
- [ ] Implement automatic transcription
- [ ] Add summary generation
- [ ] Create chapter detection
- [ ] Build transcript UI viewer

#### 🚀 Advanced AI Features
- [ ] Filler word detection and highlighting
- [ ] Action items extraction
- [ ] Export transcript with video
- [ ] Searchable transcript interface

#### 🎉 AI Polish & Launch
- [ ] Error handling for API failures
- [ ] Optimize API usage for cost
- [ ] Add AI features documentation
- [ ] Release version 2.0

### Quick Start Commands 🚀
Ready to dive in? Here's your launch sequence:

```bash
# Install Neutralino CLI (your new best friend)
npm install -g @neutralinojs/neu

# Create the magic
neu create snapcap
cd snapcap

# Fire up development mode
neu run

# Build for the world
neu build
```

## Key Decisions Archive 📋

| Decision | Date | Rationale |
|----------|------|-----------|
| 🪶 Neutralino.js over Electron | - | 10x smaller size (we love efficiency!) |
| 🎞️ FFmpeg over native APIs | - | Cross-platform simplicity that just works |
| 🧠 Groq for AI over OpenAI | - | Free tier available (budget-friendly power) |
| 🎯 Phase 1 without AI | - | Faster MVP, prove core value first |

## Essential Resources & References 📚

- 📖 [Neutralino.js Documentation](https://neutralino.js.org/docs/) - Your lightweight framework guide
- 🎬 [FFmpeg Compilation Guide](https://trac.ffmpeg.org/wiki/CompilationGuide) - Video processing mastery
- 🤖 [Groq API Documentation](https://console.groq.com/docs) - AI transcription powerhouse
- 🔍 [Loom Feature Analysis](https://www.loom.com/features) - Inspiration from the best
- 💻 [Cap.so Repository](https://github.com/cap-so/cap) - Open source screen recording reference