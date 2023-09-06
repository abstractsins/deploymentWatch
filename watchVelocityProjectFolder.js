const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const clc = require('cli-color');
let colors = {};
colors.lightPurple = clc.xterm(200);
colors.coral = clc.xterm(202);
colors.lightGreen = clc.xterm(83);
colors.lightCyan = clc.xterm(81);
colors.perrywinkle = clc.xterm(105);

const watchFolder = 'C:/Users/Hot Nickels/AppData/Local/Wavelink'; // Update this to the new folder you want to watch
const destinationFolder = 'C:/Users/Hot Nickels/OneDrive - Barcoding, Inc/ACTUAL STUFF/Project Files/Velocity Files'; // Update this to the destination local folder

var lastRunTime = new Date(); // Store the last run time


// LOG DATING
const logPath = 'C:/Users/Hot Nickels/OneDrive - Barcoding, Inc/nodeLogs/'; // Update this to the destination local folder
let month = () => lastRunTime.getMonth()+1 < 10 ? '0'+(lastRunTime.getMonth()+1) : ''+(lastRunTime.getMonth()+1);
let date = () => lastRunTime.getDate() < 10 ? '0'+lastRunTime.getDate() : ''+lastRunTime.getDate();
var logDate = ''+lastRunTime.getFullYear() + month() + date();
var logName = 'VelocityTransferLog-' + logDate + '.txt';
var logFile = logPath+logName;
var logCheck = false;

var createdDirectories = {}; // Define the createdDirectories object


function copyToDestination(item) {
  const sourcePath = item;
  const destinationPath = path.join(destinationFolder, path.relative(watchFolder, sourcePath));

  var fileArr = item.split('\\');
  fileArr.splice(0, fileArr.length-3);
  var fileAbbr = fileArr.join('/');

  fs.stat(sourcePath, (err, stats) => {
    if (err) {
      console.error(`${colors.coral('╡')} Failed to get source item stats: ${fileAbbr}`);
      return;
    }

    // Check if the item has been modified since the last run
    if (stats.mtime > lastRunTime) {
      if (stats.isDirectory()) {
        fs.copy(sourcePath, destinationPath, (copyErr) => {
          if (copyErr) {
            console.error(`${clc.red('╪═')} Failed to copy directory: ${fileAbbr}`);
            console.error(copyErr);
          } else {
            logTransfer(fileAbbr);
          }
        });
      } else if (stats.isFile()) {
        fs.copyFile(sourcePath, destinationPath, (copyErr) => {
          if (copyErr) {
            console.error(`${clc.red('╪')} Failed to copy file: ${fileAbbr}`);
            console.error(copyErr);
          } else {
            logTransfer(fileAbbr);
          }
        });
      }
    }
  });
}

function logTransfer(fileAbbr) {
  
  var dateTime = new Date;

  var hours = dateTime.getHours();
  if (hours < 10) hours = '0'+hours;

  var minutes = dateTime.getMinutes();
  if (minutes < 10) minutes = '0'+minutes;

  var seconds = dateTime.getSeconds();
  if (seconds < 10) seconds = '0'+seconds;

  var timeDisplay = `${hours}:${minutes}:${seconds}`;

  var output = `${colors.lightGreen('╪')} ${timeDisplay} Copied file: ${colors.lightCyan(fileAbbr)}`;

  console.log(output);
  writeToLog(output);

}

const watcher = chokidar.watch(watchFolder, {
  ignored: /[\/\\]\./, // Ignore dotfiles
  persistent: true,
  recursive: true, // Watch all subfolders
});

watcher
.on('add', copyToDestination)
.on('change', copyToDestination)
.on('addDir', (item) => {
  const destinationPath = path.join(destinationFolder, path.relative(watchFolder, item));

  fs.promises.access(destinationPath, fs.constants.F_OK)
    .then(() => {
      // console.log(`Directory already exists: ${destinationPath}`);
    })
    .catch(() => {
      return fs.promises.mkdir(destinationPath, { recursive: true })
        .then(() => {
          console.log(`${colors.lightGreen('╪═')} Created directory: ${colors.lightPurple(destinationPath)}`);
        })
        .catch((err) => {
          console.error(`${clc.red('╪═')} Failed to create directory: ${destinationPath}`);
          console.error(err);
          writeToLog(err);
        });
    });
})
.on('unlink', async (item) => {
  const destinationPath = path.join(destinationFolder, path.relative(watchFolder, item));

  try {
    await fs.promises.access(destinationPath, fs.constants.F_OK);
    await fs.promises.rm(destinationPath);
    console.log(`${clc.yellow('╪')} Removed item: ${destinationPath}`);
    writeToLog(`Removed item: ${destinationPath}`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`${clc.red('╪')} Failed to remove item: ${destinationPath}`);
      console.error(err);
      writeToLog(err);
    }
  }
})
.on('unlinkDir', async (item) => {
  const destinationPath = path.join(destinationFolder, path.relative(watchFolder, item));

  try {
    await fs.promises.access(destinationPath, fs.constants.F_OK);
    await fs.promises.rm(destinationPath, { recursive: true });
    console.log(`${clc.yellow('╪═')} Removed directory: ${destinationPath}`);
    writeToLog(`Removed directory: ${destinationPath}`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`${clc.red('╪═')} Failed to remove directory: ${destinationPath}`);
      console.error(err);
      writeToLog(err);
    }
  }
});


function writeToLog(log){

  fs.stat(logFile, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        
        if (logCheck === false) {

          console.log(`${colors.lightGreen('╪')} File ${logName} does not exist. Creating.`);
          // Handle the case where the file does not exist.
          
          logCheck = true;
          
        }
          
        // Write to the file
        fs.writeFile(logFile, log+'\n', (err) => {
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
      fs.appendFile(logFile, log+'\n', (err) => {
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

console.log(`Watching folder and subfolders: ${watchFolder}`);
console.log(`Copying to: ${destinationFolder}`);
console.log(`Writing to: ${logFile}`);