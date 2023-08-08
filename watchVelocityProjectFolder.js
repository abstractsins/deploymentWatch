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
const destinationFolder = 'C:/Users/Hot Nickels/OneDrive - Procensis/ACTUAL STUFF/Project Files/Velocity Files'; // Update this to the destination local folder

var lastRunTime = new Date(); // Store the last run time

var createdDirectories = {}; // Define the createdDirectories object

function copyToDestination(item) {
  const sourcePath = item;
  const destinationPath = path.join(destinationFolder, path.relative(watchFolder, sourcePath));

  var fileArr = item.split('\\');
  fileArr.splice(0, fileArr.length-3);
  var fileAbbr = fileArr.join('/');

  fs.stat(sourcePath, (err, stats) => {
    if (err) {
      console.error(`${clc.red('╫')} Failed to get source item stats: ${fileAbbr}`);
      return;
    }

    // Check if the item has been modified since the last run
    if (stats.mtime > lastRunTime) {
      if (stats.isDirectory()) {
        fs.copy(sourcePath, destinationPath, (copyErr) => {
          if (copyErr) {
            console.error(`${clc.red('╪╪')} Failed to copy directory: ${fileAbbr}`);
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
            console.log(`${colors.lightGreen('╪╪')} Created directory: ${colors.lightPurple(destinationPath)}`);
          })
          .catch((err) => {
            console.error(`${clc.red('╪╪')} Failed to create directory: ${destinationPath}`);
            console.error(err);
          });
      });
  })
  .on('unlink', async (item) => {
    const destinationPath = path.join(destinationFolder, path.relative(watchFolder, item));

    try {
      await fs.promises.access(destinationPath, fs.constants.F_OK);
      await fs.promises.rm(destinationPath);
      console.log(`${clc.yellow('╪')} Removed item: ${destinationPath}`);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error(`${clc.red('╪')} Failed to remove item: ${destinationPath}`);
        console.error(err);
      }
    }
  })
  .on('unlinkDir', async (item) => {
    const destinationPath = path.join(destinationFolder, path.relative(watchFolder, item));

    try {
      await fs.promises.access(destinationPath, fs.constants.F_OK);
      await fs.promises.rm(destinationPath, { recursive: true });
      console.log(`${clc.yellow('╪╪')} Removed directory: ${destinationPath}`);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error(`${clc.red('╪╪')} Failed to remove directory: ${destinationPath}`);
        console.error(err);
      }
    }
  });

console.log(`Watching folder and subfolders: ${watchFolder}`);