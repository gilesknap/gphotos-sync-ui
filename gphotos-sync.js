/* open-eid.js */

const { app, BrowserWindow, MenuItem, Menu, ipcMain, ipcRenderer, systemPreferences, dialog } = require('deskgap');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');

try {

  let mainWindow;
  
  ipcMain.on('test', function(e, message) {
    e.sender.send('test', '');
  });

  app.once('ready', () => {
      mainWindow = new BrowserWindow({
          title: 'gPhotos Sync',
          titleBarStyle: 'default',
          resizable: true,
          minimizable: false,
          maximizable: false,            
          show: false,
          width: 500, height: 300,
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
  	
  
} catch(e){
    dialog.showErrorBox('Error', e.stack);
    app.quit();
}

