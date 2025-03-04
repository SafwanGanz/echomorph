const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/*
 * @param {string} inputPath - Path to input MP3 file
 * @param {string} outputPath - Path to output Opus file (optional)
 * @param {Object} options - Conversion options
 * @param {number} options.bitrate - Bitrate in kbps (default: 128)
 * @param {number} options.vbr - Variable bitrate mode (0-2, default: 1)
 * @param {number} options.channels - Number of audio channels (1 or 2, default: 2)
 * @param {number} options.startTime - Start time in seconds (optional)
 * @param {number} options.duration - Duration in seconds (optional)
 * @param {function} callback - Callback function (err, result)
 */
function convertMp3ToOpus(inputPath, outputPath, options = {}, callback) {
   
    if (!inputPath || !fs.existsSync(inputPath)) {
        const error = new Error('Input file does not exist');
        return callback ? callback(error) : Promise.reject(error);
    }

    if (!inputPath.endsWith('.mp3')) {
        const error = new Error('Input file must be an MP3');
        return callback ? callback(error) : Promise.reject(error);
    }

 
    const defaultOptions = {
        bitrate: 128,
        vbr: 1,
        channels: 2,
        startTime: null,
        duration: null
    };
    const finalOptions = { ...defaultOptions, ...options };

    
    if (finalOptions.bitrate < 6 || finalOptions.bitrate > 510) {
        const error = new Error('Bitrate must be between 6 and 510 kbps');
        return callback ? callback(error) : Promise.reject(error);
    }
    if (![0, 1, 2].includes(finalOptions.vbr)) {
        const error = new Error('VBR must be 0, 1, or 2');
        return callback ? callback(error) : Promise.reject(error);
    }
    if (![1, 2].includes(finalOptions.channels)) {
        const error = new Error('Channels must be 1 (mono) or 2 (stereo)');
        return callback ? callback(error) : Promise.reject(error);
    }


    const resolvedOutputPath = outputPath || 
        path.join(
            path.dirname(inputPath),
            path.basename(inputPath, '.mp3') + '.opus'
        );

   
    let ffmpegCmd = `ffmpeg -i "${inputPath}" -c:a libopus -b:a ${finalOptions.bitrate}k`;
    
    
    ffmpegCmd += ` -vbr ${finalOptions.vbr === 0 ? 'off' : finalOptions.vbr === 1 ? 'constrained' : 'on'}`;
    
    
    ffmpegCmd += ` -ac ${finalOptions.channels}`;

    if (finalOptions.startTime !== null) {
        ffmpegCmd += ` -ss ${finalOptions.startTime}`;
    }
    if (finalOptions.duration !== null) {
        ffmpegCmd += ` -t ${finalOptions.duration}`;
    }

    ffmpegCmd += ` "${resolvedOutputPath}" -y`;


    const promise = new Promise((resolve, reject) => {
        exec(ffmpegCmd, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`FFmpeg error: ${stderr || error.message}`));
                return;
            }
            resolve({
                input: inputPath,
                output: resolvedOutputPath,
                message: 'Conversion completed successfully',
                options: finalOptions
            });
        });
    });

    if (callback) {
        promise.then(
            result => callback(null, result),
            error => callback(error)
        );
    } else {
        return promise;
    }
}


if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1 || args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage: mp3-to-opus <input.mp3> [output.opus] [options]
Options:
  --bitrate=<kbps>     Set bitrate (6-510, default: 128)
  --vbr=<0|1|2>        Variable bitrate mode (0=off, 1=constrained, 2=full, default: 1)
  --channels=<1|2>     Audio channels (1=mono, 2=stereo, default: 2)
  --start=<seconds>    Start time in seconds
  --duration=<seconds> Duration in seconds
  --help, -h          Show this help message
        `);
        process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
    }

    const inputPath = args[0];
    let outputPath = args[1]?.startsWith('-') ? null : args[1];
    const options = {};

    args.forEach(arg => {
        if (arg.startsWith('--bitrate=')) options.bitrate = parseInt(arg.split('=')[1]) || 128;
        if (arg.startsWith('--vbr=')) options.vbr = parseInt(arg.split('=')[1]) || 1;
        if (arg.startsWith('--channels=')) options.channels = parseInt(arg.split('=')[1]) || 2;
        if (arg.startsWith('--start=')) options.startTime = parseFloat(arg.split('=')[1]);
        if (arg.startsWith('--duration=')) options.duration = parseFloat(arg.split('=')[1]);
    });

    convertMp3ToOpus(inputPath, outputPath, options, (err, result) => {
        if (err) {
            console.error('Error:', err.message);
            process.exit(1);
        }
        console.log(result.message);
        console.log('Input file:', result.input);
        console.log('Output file:', result.output);
        console.log('Settings:', JSON.stringify(result.options, null, 2));
    });
}


module.exports = {
    convertMp3ToOpus
};
