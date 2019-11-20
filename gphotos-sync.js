/* open-eid.js */

const { app, BrowserWindow, MenuItem, Menu, ipcMain, ipcRenderer, systemPreferences, dialog } = require('deskgap');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { exec, execSync, spawn } = require('child_process');

try {

  let mainWindow;
  var tool = '';
  var pip = '';
  
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
          app.quit();
          
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
        console.log("Finished with code " + code);
        callback(result);
    });    
  }	
  
} catch(e){
    dialog.showErrorBox('Error', e.stack);
    app.quit();
}

