EchoMorph is a command-line tool and NPM module for converting MP3 audio files to the Opus format using FFmpeg. It offers flexible options like variable bitrate, channel selection, and audio trimming, making it ideal for audio processing tasks.

## Features
- Convert MP3 to Opus with customizable bitrate (6-510 kbps)
- Variable Bitrate (VBR) control: off, constrained, or full
- Mono or stereo output selection
- Trim audio with start time and duration options
- Usable via CLI or as an NPM module
- Promise-based or callback-based API
- Detailed error checking and help documentation

## Prerequisites
- [Node.js](https://nodejs.org/) (v12 or higher recommended)
- [FFmpeg](https://ffmpeg.org/) installed and available in your system PATH:
  - **Windows**: Download from [FFmpeg website](https://ffmpeg.org/download.html) or use a package manager like Chocolatey
  - **Mac**: `brew install ffmpeg`
  - **Linux**: `sudo apt-get install ffmpeg` (Ubuntu/Debian) or equivalent

## Installation

### As a CLI Tool
1. Clone or download this repository:
   ```bash
   git clone github.com/SafwanGanz/echomorph.git
   cd echomorph
   ```
2. Install dependencies and link globally:
   ```bash
   npm install
   npm link
   ```
3. Verify installation:
   ```bash
   echomorph --help
   ```

### As an NPM Module
Install directly from your project directory:
```bash
npm install echomorph
```

## Usage

### CLI Usage
```bash
# Basic conversion (defaults: 128kbps, stereo, constrained VBR)
echomorph input.mp3

# Specify output file and custom settings
echomorph input.mp3 output.opus --bitrate=96 --vbr=2 --channels=1

# Trim audio (start at 10s, convert 30s)
echomorph input.mp3 output.opus --start=10 --duration=30

# Show help
echomorph --help
```

**Full CLI Options:**
```
Usage: echomorph <input.mp3> [output.opus] [options]
Options:
  --bitrate=<kbps>     Set bitrate (6-510, default: 128)
  --vbr=<0|1|2>        Variable bitrate mode (0=off, 1=constrained, 2=full, default: 1)
  --channels=<1|2>     Audio channels (1=mono, 2=stereo, default: 2)
  --start=<seconds>    Start time in seconds
  --duration=<seconds> Duration in seconds
  --help, -h          Show this help message
```

### NPM Module Usage
```javascript
const { convertMp3ToOpus } = require('echomorph');

// Promise-based example
convertMp3ToOpus('input.mp3', 'output.opus', {
    bitrate: 64,
    vbr: 2,         // Full VBR
    channels: 1,    // Mono
    startTime: 5,   // Start at 5 seconds
    duration: 20    // Convert 20 seconds
})
    .then(result => console.log(result))
    .catch(err => console.error(err));

// Callback-based example
convertMp3ToOpus('input.mp3', null, {
    bitrate: 96,
    vbr: 0,         // Constant bitrate
    channels: 2     // Stereo
}, (err, result) => {
    if (err) console.error(err);
    else console.log(result);
});
```

**API Parameters:**
- `inputPath` (string): Path to the input MP3 file (required)
- `outputPath` (string): Path to the output Opus file (optional, auto-generated if omitted)
- `options` (object):
  - `bitrate` (number): Bitrate in kbps (6-510, default: 128)
  - `vbr` (number): VBR mode (0=off, 1=constrained, 2=full, default: 1)
  - `channels` (number): Audio channels (1=mono, 2=stereo, default: 2)
  - `startTime` (number): Start time in seconds (optional)
  - `duration` (number): Duration in seconds (optional)
- `callback` (function): Optional callback (err, result)

**Result Object:**
```json
{
    "input": "input.mp3",
    "output": "input.opus",
    "message": "Conversion completed successfully",
    "options": {
        "bitrate": 128,
        "vbr": 1,
        "channels": 2,
        "startTime": null,
        "duration": null
    }
}
```

## Troubleshooting
- **FFmpeg not found**: Ensure FFmpeg is installed and added to your system PATH.
- **Invalid options**: Check the help message (`--help`) for valid ranges.
- **Permissions**: Run with appropriate file system permissions.

