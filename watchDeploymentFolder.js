// Adapted from ChatGPT

const chokidar = require('chokidar');
const { exec } = require('child_process');

const clc = require('cli-color');
let colors = {};
colors.lightPurple = clc.xterm(200);
colors.coral = clc.xterm(202);
colors.lightGreen = clc.xterm(83);
colors.lightCyan = clc.xterm(81);
colors.perrywinkle = clc.xterm(105);

const watchFolder = 'C:/Users/Hot Nickels/OneDrive - Procensis/ACTUAL STUFF/Deployments/__WATCH FOLDER';
const androidDestination = '/sdcard/Android/data/com.wavelink.velocity/files';

var count = 0;

function copyToAndroid(file){
  const adbCmd = `adb push "${file}" ${androidDestination}`;
  var fileArr = file.split('\\');
  fileArr.splice(0, fileArr.length-3);
  var fileAbbr = fileArr.join('/');
  exec(adbCmd, (error) => {
    if (error) {

      console.error(`\n${clc.red('╔╩╬╩╗')} Failed to copy file to Android: ${fileAbbr}`);

    } else {
      logTransfer(fileAbbr);
    }
  });
};

function logTransfer(fileAbbr){
  count++;
  if (count < 10) {
      count = '00' + count;
  } else if (count < 100) {
      count = '0' + count;
  }

  var dateTime = new Date;

  var hours = dateTime.getHours();
  if (hours < 10) hours = '0'+hours;

  var minutes = dateTime.getMinutes();
  if (minutes < 10) minutes = '0'+minutes;

  var seconds = dateTime.getSeconds();
  if (seconds < 10) seconds = '0'+seconds;

  var countDisplay = `#${count}`;
  var timeDisplay = `${hours}:${minutes}:${seconds}`;

  var firstLine = `\n╔═{${colors.coral(countDisplay)}}═══════[${colors.lightGreen(timeDisplay)}]═════╕`;
  var firstLineLength = firstLine.length;

  var sourceLine = `║ Copied file: ${colors.lightCyan(fileAbbr)}     │`;
  var sourceLength = sourceLine.length;

  var androidLine = `║ To Android: ${colors.perrywinkle(androidDestination)}     │`;
  var androidLength = androidLine.length;

  var lastLine = `╙──┘`;
  var lastLineLength = lastLine.length;

  var diffFirst, diffLast, diffAndroid, diffSource;

  // Determine lengths
  if (androidLength > sourceLength) {
    diffFirst = androidLength - firstLineLength;
    diffSource = androidLength - sourceLength;
    diffAndroid = 0;
    diffLast = androidLength - lastLineLength;
  } else {
    diffFirst = sourceLength - firstLineLength;
    diffSource = 0;
    diffAndroid = sourceLength - androidLength;
    diffLast = sourceLength - lastLineLength;
  }

  // First Line
  var fillFirst = new Array(diffFirst+12).join('═');
  var firstLineArr = firstLine.split('');
  firstLineArr.splice(firstLineLength-1,0,fillFirst);
  firstLine = firstLineArr.join('');

  // Source Line
  var fillSource = new Array(diffSource+1).join(' ');
  var sourceLineArr = sourceLine.split('');
  sourceLineArr.splice(sourceLength-1,0,fillSource);
  sourceLine = sourceLineArr.join('');

  // Android Line
  var fillAndroid = new Array(diffAndroid+1).join(' ');
  var androidLineArr = androidLine.split('');
  androidLineArr.splice(androidLength-1,0,fillAndroid);
  androidLine = androidLineArr.join('');
  
  // Last Line
  var fillLast = new Array(diffLast-9).join('─');
  var lastLineArr = lastLine.split('');
  lastLineArr.splice(lastLineLength-1,0,fillLast);
  lastLine = lastLineArr.join('');

  console.log(firstLine);
  console.log(sourceLine);           
  console.log(androidLine);
  console.log(lastLine);

}

const watcher = chokidar.watch(watchFolder, {
  ignored: /[\/\\]\./, // Ignore dotfiles
  persistent: true,
});

watcher
  .on('add', copyToAndroid)
  .on('change', copyToAndroid);

console.log(`Watching folder: ${watchFolder}`);


/**
 * END OF INPUT - THIS SPACE INTENTIONALLY LEFT BLANK
 * 
 * 
 *  
 */