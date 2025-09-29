// Adapted from ChatGPT

const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs');

const clc = require('cli-color');
let colors = {};
colors.lightPurple = clc.xterm(200);
colors.coral = clc.xterm(202);
colors.lightGreen = clc.xterm(83);
colors.lightCyan = clc.xterm(81);
colors.perrywinkle = clc.xterm(105);

const watchFolder = 'D:/OneDrive - Barcoding, Inc/ACTUAL STUFF/Deployments/__WATCH FOLDER';
const androidDestination = '/sdcard/Android/data/com.wavelink.velocity/files';

var count = 0;

// LOG DATING
const lastRunTime = new Date();
const logPath = 'D:/OneDrive - Barcoding, Inc/nodeLogs/'; // Update this to the destination local folder
let month = () => lastRunTime.getMonth()+1 < 10 ? '0'+(lastRunTime.getMonth()+1) : ''+(lastRunTime.getMonth()+1);
let date = () => lastRunTime.getDate() < 10 ? '0'+lastRunTime.getDate() : ''+lastRunTime.getDate();
var logDate = ''+lastRunTime.getFullYear() + month() + date();
var logName = 'AndroidDeploymentLog-' + logDate + '.txt';
var logFile = logPath+logName;
var logCheck = false;

// COPY TO ANDROID
function copyToAndroid(file){
  const adbCmd = `adb push "${file}" ${androidDestination}`;
  var fileArr = file.split('\\');
  fileArr.splice(0, fileArr.length-3);
  var fileAbbr = fileArr.join('/');
  exec(adbCmd, (error) => {
    if (error) {

      console.error(`\n${clc.red('╔╩╬╩╗')} Failed to copy file to Android: ${fileAbbr}`);
      writeToLog(`ERROR: Failed to copy file to Android: ${fileAbbr}`)

    } else {
      logTransfer(fileAbbr);
      writeToLog(fileAbbr);
    }
  });
};

// LOG TRANSFER
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
  
  writeToLog(firstLine +' --------');           
  // writeToLog(firstLine);           
  writeToLog(sourceLine);           
  writeToLog(androidLine);
  writeToLog('\n');           

}

const watcher = chokidar.watch(watchFolder, {
  ignored: /[\/\\]\./, // Ignore dotfiles
  persistent: true,
});

watcher
.on('add', copyToAndroid)
.on('change', copyToAndroid);


function writeToLog(log){

  log = log.replaceAll('[90m', '');
  log = log.replaceAll('[91m', '');
  log = log.replaceAll('[92m╪', '');
  log = log.replaceAll('[92m', '');
  log = log.replaceAll('[96m', '');
  log = log.replaceAll('[39m', '');
  log = log.replaceAll('║', '');
  log = log.replaceAll('│', '');
  log = log.replaceAll('═', '');
  log = log.replaceAll('╔', '');
  log = log.replaceAll('╕', '');
  
  fs.stat(logFile, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        
        if (logCheck === false) {

          console.log(`${colors.lightGreen('╪')} File ${logName} does not exist. Creating.`);
          // Handle the case where the file does not exist.
          
          logCheck = true;
          
        }
          
        // Write to the file
        fs.writeFileSync(logFile, log+'\n', (err) => {
          if (err) {
            console.error(`${clc.red('╪')} Error writing to file:`, err);
          } else {
            if (logCheck === false) {
              console.log(`${colors.lightGreen('╪')} Data has been written to`, logName);
            }
          }
        });

      } else {
        console.error(`${clc.red('╪')} Error checking file existence:`, err);
        // Handle other errors that may occur during the file check.
      }
    } else {

      if (logCheck === false) {

        console.log(`${clc.yellow('╪')} File ${logName} exists. Appending.`);
        // You can perform further operations here, like reading or deleting the file.
      
        logCheck = true;

      }

      // Write to the file
      fs.appendFileSync(logFile, log+'\n', (err) => {
        if (err) {
          console.error(`${clc.red('╪')} Error writing to file:`, err);
        } else {
          if (logCheck === false) {
            console.log(`${colors.lightGreen('╪')} Data has been appended to`, logName);
          }
        }
      });

    }
  });

}

console.log(`Watching folder: ${watchFolder}`);


/**
 * END OF INPUT - THIS SPACE INTENTIONALLY LEFT BLANK
 * 
 * 
 *  
 */