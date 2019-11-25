/* open-eid.js */

const { app, BrowserWindow, MenuItem, Menu, ipcMain, ipcRenderer, systemPreferences, dialog } = require('deskgap');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { exec, execSync, spawn } = require('child_process');
const https = require('https');

try {

  let mainWindow = null;
  let gPhotos = null;
  var tool = '';
  var pip = '';
  var prevTitle = '';
  var downloadData = [];
  var downloadIndex = -1;
  
  ipcMain.on('showOpenDialog', function(event, data) {
    dialog.showOpenDialog(mainWindow, data.options, function(result) {
      data.result = result;
      event.sender.send('showOpenDialog', data);
    });
  });

  ipcMain.on('readFileSync', function(event, data) {
    data.data = fs.readFileSync(data.path).toString('base64');
    event.sender.send('readFileSync', data);
  });

  ipcMain.on('download', function(event, data) {
    if('html' in data) {
      var url = new String(data.html).match(/data-url=\"([^\"]+)\"/);
      if(url == null) url = new String(data.html).match(/data-image-url=\"([^\"]+)\"/);
      if(url) {
        https.get(url[1] + '=d', { headers: { range: 'bytes=0-1' } }, function(r) {
          if(parseInt(r.headers['content-range'].substring(r.headers['content-range'].indexOf('/') + 1)) == fs.statSync(data.path)['size']) {
            //mainWindow.webView.send('status', syncTime() + ' WARNING Local file already up-to-update (' + r.headers['content-range'].substring(r.headers['content-range'].indexOf('/') + 1) + ', ' + fs.statSync(data.path)['size'] + '): ' + data.path);           
            r.on('data', function(chunk) {
            });
            r.on('end', function() {
              download();
            });
            r.on('error', function() {
              download();
            });            
          } else {
            https.get(url[1] + '=d', function(r2) {            
              var contents = [];            
              r2.on('data', function(chunk) {
                contents.push(chunk);
              });
              r2.on('end', function() {
                if(Buffer.concat(contents).length == fs.statSync(data.path)['size']) {
                  // no update required
                } else {
                  if(Buffer.concat(contents).length > fs.statSync(data.path)['size']) {
                    fs.writeFileSync(data.path, Buffer.concat(contents));
                  } else {
                    //mainWindow.webView.send('status', syncTime() + ' WARNING Local file is bigger(' + Buffer.concat(contents).length + ', ' + fs.statSync(data.path)['size'] + '): ' + data.path);
                  }
                }
                download();
              });
              r2.on('error', function() {
                download();
              });              
            });
          }
        });
      }
    } else {
      downloadData = data;
      downloadIndex = -1;
      download();
    }
  });
  
  function download() {
    downloadIndex++;
    var i = downloadIndex;
    var data = downloadData;
    if(data[i] == null || typeof data[i] == 'undefined') {
      gPhotos.show();
      downloadIndex = -1;
      return;
    }
    if('url' in data[i]) {
      gPhotos.on('closed', function() {
        gPhotos = new BrowserWindow({
            title: 'gPhotos',
            titleBarStyle: 'default',
            resizable: true,
            minimizable: true,
            maximizable: false,            
            show: false,
            width: 1000, height: 700,
            center: true,
        }).once('ready-to-show', function() {
          try {
            //gPhotos.show();
            gPhotos.webView.executeJavaScript('window.deskgap.messageUI.send(\'download\', {html: document.body.innerHTML, path: decodeURIComponent(\'' + encodeURIComponent(data[i].path) + '\')})');
          } catch(e) {
            dialog.showErrorBox('Error', e.stack);            
          }
        });
        mainWindow.webView.send('status', syncTime() + ' WARNING Web download ' + (i + 1) + '/' + data.length);
        gPhotos.loadURL(data[i].url);
      });        
      gPhotos.close();
    }
  }

  function syncTime() {
    var d = new Date();
    var h = d.getHours();
    if(h < 10) h = '0' + h;
    var m = d.getMinutes();
    if(m < 10) m = '0' + m;
    var s = d.getSeconds();
    if(s < 10) s = '0' + s;    
    return (d.getMonth() + 1) + '-' + d.getDate() + ' ' + [h, m, s].join(':')
  }

  ipcMain.on('saveSettings', function(event, data) {
    fs.writeFileSync(path.join(os.homedir(), 'gPhotos Sync Settings.json'), JSON.stringify(data)); 
  });

  ipcMain.on('loadSettings', function(event, data) {
    try {
      data.data = fs.readFileSync(path.join(os.homedir(), 'gPhotos Sync Settings.json')).toString();
    } catch(e) {
      data.data = '{}';
    }
    event.sender.send('loadSettings', data);
  });

  ipcMain.on('sync', function(event, lib) {
    var exe = tool.split(' ')[0];
    var args = lib.flags;
    for(var i in args) {
      if(args[i] == '--web-download') {
        if(gPhotos == null) {
          gPhotos = new BrowserWindow({
              title: 'gPhotos',
              titleBarStyle: 'default',
              resizable: true,
              minimizable: true,
              maximizable: false,            
              show: false,
              width: 1000, height: 700,
              center: true,
          }).once('ready-to-show', () => {
            
            try {
              
              gPhotos.setMenu(null);    
              gPhotos.show();
              if(os.platform() == 'darwin') exec('osascript -e \'tell application "gPhotos" to activate\'');
              gPhotos.webView.executeJavaScript('location = \'https://photos.google.com/albums?hl=en\'');
                      
            } catch(e){
              
              dialog.showErrorBox('Error', e.stack);
              
            }            
          });  
    
          setInterval(function() {
            if(gPhotos == null) {
              return;
            } else {
              if(gPhotos.isDestroyed()) return;
            }
            try {
              var title = gPhotos.getTitle();
              if(title.indexOf('Sign in') == 0 && title != prevTitle) dialog.showErrorBox('Info', 'Please sign in');
              if(title.indexOf('Albums') == 0 && title != prevTitle) {
                //gPhotos.minimize();
              }
              if(title != '') prevTitle = title;
            } catch(e2) {
              //
            }
          }, 3000);
          
          gPhotos.on('closed', function() {
            prevTitle = '';
            gPhotos = null;
          });          
          
          gPhotos.loadFile('gphotos.html');  // load website
          
        } else {
          
          gPhotos.show();
          gPhotos.loadFile('gphotos.html');  // load website
          
        }    

        delete args[i];
        args = args.filter(function() { return true });
      }
    }
    args.push(lib.path);
    //dialog.showErrorBox('Info', exe + ' => ' + args.join(','));
    var sync = spawn(exe, args, {cwd: os.homedir()});
    sync.stdout.on('data', function(data) {
      event.sender.send('status', data.toString());
    });
    sync.stderr.on('data', function(data) {
      event.sender.send('status', data.toString());
    });
  });
  
  // find tool
  locate(['gphotos-sync', 'gphotos-sync.*'], function(result) {
    tool = result;
    if(tool == '') {
      // find pipenv
      locate(['pipenv', 'pipenv.exe'], function(result) {
        pip = result;
        // find python
        if(pip == '') {
          locate(['python3', 'python*.exe'], function(result) {
            pip = result;
            if(pip != '') {
              pip += ' -m pip'; 
              about_tools();
            }
          });
        } else {
          about_tools();
        }
      });    
    }   
  });
    
  function about_tools() {
    fs.writeFileSync(path.join(os.homedir(), 'gPhotos Sync.log'), JSON.stringify([tool, pip]));    
    if(pip == '') {
      dialog.showErrorBox('Error', 'python/pip not installed');
    } else {
      run(pip + ' show gphotos-sync', function(result) {
        if(result != '' && pip.indexOf('pipenv') == 0) {
          tool = pip + ' run gphotos-sync';
        } else {
          tool = '/usr/local/bin/gphotos-sync';
        }
        if(tool == '') dialog.showErrorBox('Error', 'gphotos-sync not installed');
        //dialog.showErrorBox('Info', 'gphotos-sync installed @' + tool + ', pip installed @' + pip);    
      });
    }
  }
  
  app.once('ready', () => {
    
      mainWindow = new BrowserWindow({
          title: 'gPhotos Sync',
          titleBarStyle: 'default',
          resizable: true,
          minimizable: false,
          maximizable: false,            
          show: false,
          width: 1000, height: 700,
          center: true,
      }).once('ready-to-show', () => {
        
        try {
          
          mainWindow.setMenu(null);    
          mainWindow.show();
          if(os.platform() == 'darwin') exec('osascript -e \'tell application "gPhotos Sync" to activate\'');
        
        } catch(e){
          
          dialog.showErrorBox('Error', e.stack);
          //app.quit();
          
        }            
      });

      mainWindow.loadFile('gphotos-sync.html');
  
      mainWindow.on('closed', () => {
          mainWindow = null;
          app.quit();
      });        
  });      	  	
  
  function locate(path, callback) {
    var where = 'which ' + path[0];
    if(os.platform().indexOf('win') == 0) where = 'where /r "%ProgramFiles%" ' + path[1]; // ???
    var found = [''];
    try {
      run(where, function(result) {
        found = result.replace(/\r/g, '').split('\n');
        for(var i in found) {
          if(found[i] != '') {
            callback(found[i]);
            return;
          }
        }
        callback('');    
      });
    } catch(e) {
    }
  }
  
  function run(cmd, callback) {
    var spawn = require('child_process').spawn;
    
    //kick off process of listing files
    args = cmd.split(' ');
    var proc = args[0];
    delete args[0];
    var child = spawn(proc, args);
    
    var result = '';
    
    //spit stdout to screen
    child.stdout.on('data', function (data) {   process.stdout.write(data.toString()); result += data.toString(); });
    
    //spit stderr to screen
    child.stderr.on('data', function (data) {   process.stdout.write(data.toString()); result += data.toString(); });
    
    child.on('close', function (code) { 
        console.log('Finished with code ' + code);
        callback(result);
    });    
  }	
  
} catch(e){
    dialog.showErrorBox('Error', e.stack);
    //app.quit();
}

