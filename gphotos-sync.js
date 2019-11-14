/* open-eid.js */

const { app, BrowserWindow, MenuItem, Menu, ipcMain, ipcRenderer, systemPreferences, dialog } = require('deskgap');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');

try {

  let mainWindow;
  var pip = '';
  var tool = '';
  
  ipcMain.on('test', function(e, message) {
    e.sender.send('test', '');
  });
  
  // find tool
  locate(['gphotos-sync', 'gphotos-sync.*'], function(result) {
    tool = result;
    if(tool == '') {
      // find pip
      locate(['pip', 'pip.exe'], function(result) {
        pip = result;
        // find python
        if(pip == '') {
          locate(['python3', 'python*.exe'], function(result) {
            pip = result;
            if(pip != '') pip += ' -m pip';   
            about_tools();         
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
        if(result != '') tool = pip + ' run gphotos-sync';
        if(tool == '') dialog.showErrorBox('Error', 'gphotos-sync not installed');
        dialog.showErrorBox('Info', 'gphotos-sync installed @' + tool + ', pip installed @' + pip);    
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
          width: 700, height: 500,
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

