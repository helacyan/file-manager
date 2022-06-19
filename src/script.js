import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import os from "os";
import fs from 'fs';
import path from 'path';
import { copyFile } from 'fs/promises';
import  crypto  from 'crypto'
import { createReadStream, createWriteStream } from "fs";
import zlib  from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colours = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  fg: {
      red: "\x1b[31m",
      green: "\x1b[32m",
      cyan: "\x1b[36m",
  },
  bg: {
      red: "\x1b[41m",
      green: "\x1b[42m",
  }
};

export const main = async () => {
  const args = process.argv.slice(2);
  const userHomeDir = os.homedir();
  process.chdir(userHomeDir);
  console.log(colours.reverse, `Welcome to the File Manager, ${args[1].slice(2).split('=')[1]}`, colours.reset)
  console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
  let scwd = process.cwd().split("\\")
  process.on("SIGINT", function () {
    console.log(colours.fg.green, colours.reverse , `Thank you for using File Manager, ${args[1].slice(2).split('=')[1]}!`, colours.reset)
    process.exit();
  });
  process.stdin.on('data', data => {
    if (data.toString().trim() == '.exit') {
      console.log(colours.fg.green, colours.reverse , `Thank you for using File Manager, ${args[1].slice(2).split('=')[1]}!`, colours.reset)
      process.exit(0)
    } else if (data.toString().trim() == 'up') {
      if ( process.cwd() !== userHomeDir) {
        scwd = process.cwd().split("\\")
        let newDir = scwd.length > 2 ? scwd.slice(0, scwd.length - 1).join("\\") : scwd.slice(0, scwd.length - 1) + "\\"
        process.chdir(newDir);
      }
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    } else if (data.toString().startsWith('cd')) {
       if (data.toString().trim().split(' ')[1]) {
        fs.access(data.toString().trim().split(' ')[1], fs.F_OK, (err) => {
          if (err) {
            console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
          } else {
            process.chdir(resolve(data.toString().trim().split(' ')[1]))
            console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
          }
        })
      } else console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
    } else if (data.toString().trim() == 'ls') {
      fs.access(process.cwd(), fs.F_OK, (err) => {
        if (!err) {
          fs.readdir(process.cwd(), function(err, items) {
                for (var i=0; i<items.length; i++) {
                    console.log(items[i]);
                }
            });
        } else {
          console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
        }
      })
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    } else if (data.toString().trim() == 'os --EOL') {
      console.log(colours.fg.cyan, JSON.stringify(os.EOL), colours.reset);
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    } else if (data.toString().trim() == 'os --cpus') {
      let cpus = os.cpus()
      console.log(colours.fg.cyan, cpus.length + ' CPUs overall. ' + cpus[0].model.trim(), colours.reset);
      for ( let i = 0; i < cpus.length; i++) {
        console.log(colours.fg.cyan, `CPU: ${i + 1}, clock rate ${cpus[i].speed/1000} GHz`, colours.reset)
      }
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    } else if (data.toString().trim() == 'os --username') {
      console.log(colours.fg.cyan, os.userInfo().username, colours.reset);
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    } else if (data.toString().trim() == 'os --homedir') {
      console.log(colours.fg.cyan, os.homedir(), colours.reset);
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    } else if (data.toString().trim() == 'os --architecture') {
      console.log(colours.fg.cyan, os.arch(), colours.reset);
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    } else if (data.toString().trim().startsWith('cat')) {
      if (data.toString().trim().split(' ')[1]) {
        fs.access(data.toString().trim().split(' ')[1], fs.F_OK, (err) => {
          if (!err) {
              fs.readFile(data.toString().trim().split(' ')[1], 'utf8', (err, data) => {
              if (err) {
                  console.error(err);
                  return;
              }
              console.log(data.trim());
              });
          } else {
            console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
          }
        })
      } else console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    } else if (data.toString().trim().startsWith('add')) {
      if (data.toString().trim().split(' ')[1]) {
        fs.access(process.cwd() + '\\' + data.toString().trim().split(' ')[1], fs.F_OK, (err) => {
          if (err) {
            fs.writeFile(process.cwd() + '\\' + data.toString().trim().split(' ')[1], '', (err) => {
                  if (err) console.log(err);
                  else console.log(colours.fg.cyan, `file ${data.toString().trim().split(' ')[1]} was successfully created`, colours.reset)
                });
          } else {
            console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
          }
        })
      } else console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    } else if (data.toString().trim().startsWith('rn')) {
      if (data.toString().trim().split(' ')[1] && data.toString().trim().split(' ')[2]) {
        fs.access(data.toString().trim().split(' ')[1], fs.F_OK, (err) => {
          if (!err) {
            fs.access(data.toString().trim().split(' ')[2], fs.F_OK, (err_n) => {
              if (err_n) {
                fs.rename(data.toString().trim().split(' ')[1], data.toString().trim().split(' ')[2], (err) => {
                  if (err) throw err;
                  else console.log(colours.fg.cyan, `You have successfully renamed ${path.basename(data.toString().trim().split(' ')[1])} to ${path.basename(data.toString().trim().split(' ')[2])}`, colours.reset)
                });;
              } else {
                console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
              }
            })
          } else {
            console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
          }
      })
      } else console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    } else if (data.toString().trim().startsWith('cp')) {
      if (data.toString().trim().split(' ')[1] && data.toString().trim().split(' ')[2]) {
        fs.access(data.toString().trim().split(' ')[1], fs.F_OK, (err) => {
          if (!err) {
            fs.access(path.dirname(data.toString().trim().split(' ')[2]), fs.F_OK, (err_n) => {
              if (err_n) console.log(colours.fg.red, 'Error message: Operation failed', colours.reset, err_n)
              else {
                console.log(colours.fg.cyan, `You have successfully copied ${path.basename(data.toString().trim().split(' ')[1])}`, colours.reset)
                copyFile(data.toString().trim().split(' ')[1], data.toString().trim().split(' ')[2])
              }
            })
          } else {
            console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
          }
      })
      } else console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    }
    else if (data.toString().trim().startsWith('mv')) {
      if (data.toString().trim().split(' ')[1] && data.toString().trim().split(' ')[2]) {
        fs.access(data.toString().trim().split(' ')[1], fs.F_OK, (err) => {
          if (!err) {
            fs.access(path.dirname(data.toString().trim().split(' ')[2]), fs.F_OK, (err_n) => {
              if (err_n) console.log(colours.fg.red, 'Error message: Operation failed', colours.reset, err_n)
              else {
                copyFile(data.toString().trim().split(' ')[1], data.toString().trim().split(' ')[2])
                console.log(colours.fg.cyan, `You have successfully moved ${path.basename(data.toString().trim().split(' ')[1])}`, colours.reset)
                fs.unlink(data.toString().trim().split(' ')[1], err => { if (err) console.log(colours.fg.red, 'Error message: Operation failed', colours.reset, err)})
              }
            })
          } else {
            console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
          }
      })
      } else console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    } else if (data.toString().trim().startsWith('rm')) {
      if (data.toString().trim().split(' ')[1]) {
        fs.access(data.toString().trim().split(' ')[1], fs.F_OK, (err) => {
          if (!err) {
            fs.rm(data.toString().trim().split(' ')[1], (err) => err)
            console.log(colours.fg.cyan, `You have successfully deleted ${path.basename(data.toString().trim().split(' ')[1])}`, colours.reset)
          } else {
            console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
          }
        })
      } else console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    } else if (data.toString().trim().startsWith('hash')) {
      if (data.toString().trim().split(' ')[1]) {
        fs.readFile(data.toString().trim().split(' ')[1], 'utf8', (err, content) => {
          if (err) {
              console.error(err);
              return;
          }
          const hashSum = crypto.createHash('sha256')
          hashSum.update(content)
          const hex = hashSum.digest('hex')
          console.log(hex.trim())
          });

      } else console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    } else if (data.toString().trim().startsWith('compress')) {
      if (data.toString().trim().split(' ')[1] && data.toString().trim().split(' ')[2]) {
        fs.access(data.toString().trim().split(' ')[1], fs.F_OK, (err) => {
          if (!err) {
            fs.access(path.dirname(data.toString().trim().split(' ')[2]), fs.F_OK, (err_n) => {
              if (err_n) console.log(colours.fg.red, 'Error message: Operation failed', colours.reset, err_n)
              else {
                const source = createReadStream(data.toString().trim().split(' ')[1])
                const place = createWriteStream(data.toString().trim().split(' ')[2])
                const brotli = zlib.createBrotliCompress();
                const stream = source.pipe(brotli).pipe(place);
                stream.on('finish', () => {
                  console.log(colours.fg.cyan, `You have successfully compressed ${path.basename(data.toString().trim().split(' ')[1])}`, colours.reset)
                });
              }
            })
          } else {
            console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
          }
        })
      } else console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    } else if (data.toString().trim().startsWith('decompress')) {
      if (data.toString().trim().split(' ')[1] && data.toString().trim().split(' ')[2]) {
        fs.access(data.toString().trim().split(' ')[1], fs.F_OK, (err) => {
          if (!err) {
            fs.access(path.dirname(data.toString().trim().split(' ')[2]), fs.F_OK, (err_n) => {
              if (err_n) console.log(colours.fg.red, 'Error message: Operation failed', colours.reset, err_n)
              else {
                const source = createReadStream(data.toString().trim().split(' ')[1])
                const place = createWriteStream(data.toString().trim().split(' ')[2])
                const brotli = zlib.createBrotliDecompress();
                const stream = source.pipe(brotli).pipe(place);
                stream.on('finish', () => {
                  console.log(colours.fg.cyan, `You have successfully decompressed ${path.basename(data.toString().trim().split(' ')[1])}`, colours.reset)
                });
              }
            })
          } else {
            console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
          }
        })
      } else console.log(colours.fg.red, 'Error message: Operation failed', colours.reset)
      console.log(colours.fg.green, 'You are currently in ' + process.cwd(), colours.reset)
    } else console.log(colours.fg.red, 'Invalid input', colours.reset)
  })
};

main()