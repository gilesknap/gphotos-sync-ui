/* gphotos-sync-ui.js */

var asyncNode = window.deskgap.asyncNode;
var messageUI = window.deskgap.messageUI;
var currentDB = {};
var settings = {};
var currentPage = 'sync';
var currentSync = {};

settings.libraries = [];

messageUI.send('loadSettings', {callback: 'loadSettings'});

window.addEventListener('load', function() {
  document.getElementById('menu-sync').addEventListener('click', switchPage);
  document.getElementById('menu-settings').addEventListener('click', switchPage);
  document.getElementById('menu-log').addEventListener('click', switchPage);
  document.getElementById('menu-about').addEventListener('click', switchPage);
  document.getElementById('add').addEventListener('click', addDirectory);
});

messageUI.on('showOpenDialog', function(event, data) {
  console.log(data);
  var fx = window[data.callback];
  fx(data);
});

messageUI.on('readFileSync', function(event, data) {
  console.log(data);
  var fx = window[data.callback];
  fx(data);
});

messageUI.on('loadSettings', function(event, data) {
  console.log(data);
  var fx = window[data.callback];
  fx(data);
});

messageUI.on('status', function(event, data) {
  var tt = document.createElement('tt');
  tt.innerText = data;
  document.getElementById('status').appendChild(tt);
  setTimeout(function() {
    document.getElementById('status').scrollIntoView(false);
  }, 100);
  if('flags' in currentSync) {
    for(var i in currentSync.flags) {
      if(data.indexOf('Done.') != -1 && currentSync.flags[i] == '--web-download') {
        path = currentSync.path;
        if(!path.endsWith('.sqlite') || path.endsWith('/')) {
          if(!path.endsWith('/')) path += '/';
          path += 'gphotos.sqlite';
        }
        messageUI.send('readFileSync', {path: path, callback: 'download'});
      }
    }
  }
});

function download(db) {
  currentDB = db;
  var rootDir = db.path;
  if(rootDir.endsWith('/gphotos.sqlite')) rootDir = rootDir.substring(0, rootDir.length - new String('/gphotos.sqlite').length);
  if(!rootDir.endsWith('/')) rootDir += '/';
  initSqlJs({}).then(function(SQL){  
    var data = b64toarray(currentDB.data);
    var db = new SQL.Database(data);
    data = [];
    var files = db.exec('SELECT Url, Path, FileName FROM SyncFiles');
    if(typeof files[0] != 'object') return;
    if('values' in files[0]) {
      for(var i in files[0].values) {
        var realPath = rootDir + files[0].values[i][1] + '/' + files[0].values[i][2];
        data.push({url: files[0].values[i][0], path: realPath});
      }
      messageUI.send('download', data);
    }
  });
}

function parseHTML(html) {
  console.log(html);
}

function switchPage(event) {
  var el = event.target;
  if(currentPage != '') document.getElementById(currentPage).style.display = 'none';
  currentPage = el.id.replace('menu-', '');
  document.getElementById(currentPage).style.display = 'block';
  document.querySelector('.mdl-layout__obfuscator').click();
}

function addDirectory(event) {
  messageUI.send('showOpenDialog', {options: {title: 'Add library', buttonLabel: 'Add', message: 'Pick a folder to add or create a new sync', filters: [{name: 'gPhotos Sync Database', extensions: ['sqlite']}], 'properties': ['openFile', 'openDirectory', 'showHiddenFiles', 'createDirectory', 'treatPackageAsDirectory']}, callback: 'loadDirectory'});
}

function loadDirectory(data) {
  //console.log(data);
  data.path = new String(data.result[0]);
  if(!data.path.endsWith('.sqlite') || data.path.endsWith('/')) {
    if(!data.path.endsWith('/')) data.path += '/';
    data.path += 'gphotos.sqlite';
  }
  delete data.options;
  delete data.result;
  data.callback = 'loadDatabase';
  messageUI.send('readFileSync', data);
}

function loadDatabase(db) {
  //console.log(db);
  currentDB = db;
  initSqlJs({}).then(function(SQL){  
    var data = b64toarray(currentDB.data);
    var db = new SQL.Database(data);
    var count = db.exec('SELECT COUNT(*) AS CountAlbums FROM Albums');
    console.log(count);
    var lib = {};
    lib.path = currentDB.path;
    lib.albums = count[0].values[0][0];
    if(!('libraries' in settings)) settings.libraries = [];
    var found = false;
    for(var i in settings.libraries) {
      if(settings.libraries[i].path == lib.path) {
        settings.libraries[i] = lib;
        found = true;
        break;
      }
    }
    if(!found) settings.libraries.push(lib);
    saveSettings();
    showLibraries();
  });
}

function showLibraries() {
  document.getElementById('sync-libraries').innerText = '';
  for(var i in settings.libraries) {
    var lib = document.createElement('div');
    lib.setAttribute('id', 'lib-' + i);
    lib.setAttribute('class', 'lib mdl-card mdl-shadow--2dp');
    for(var k in settings.libraries[i]) {
      lib.setAttribute('data-' + k, settings.libraries[i][k]);
    }
    var title = document.createElement('div');
    title.setAttribute('class', 'mdl-card__title');
    var h2 = document.createElement('h2');
    h2.setAttribute('class', 'mdl-card__title-text');
    var parts = settings.libraries[i].path.split(/[\/\\]/g);
    console.log(parts);
    h2.innerText = parts[parts.length - 2];
    var content = document.createElement('div');
    content.setAttribute('class', 'mdl-card__supporting-text');
    content.innerText = 'Path: ' + settings.libraries[i].path + '\nAlbums: ' + settings.libraries[i].albums;
    var actions = document.createElement('div');
    actions.setAttribute('class', 'mdl-card__actions mdl-card--border');
    var action1 = document.createElement('a');
    action1.setAttribute('class', 'mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect');
    action1.innerText = 'Sync';
    var action2 = document.createElement('a');
    action2.setAttribute('class', 'mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect');
    action2.innerText = 'Settings';
    var action3 = document.createElement('a');
    action3.setAttribute('class', 'mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect');
    action3.innerText = 'Remove';
    title.appendChild(h2);
    lib.appendChild(title);
    lib.appendChild(content);
    actions.appendChild(action1);
    actions.appendChild(action2);
    actions.appendChild(action3);
    action1.addEventListener('click', sync);
    action2.addEventListener('click', edit);
    lib.appendChild(actions);       
    document.getElementById('sync-libraries').appendChild(lib);
  }
}

function sync(event) {
  if(!event) event = window.event;
  var el = event.target || event.srcElement;
  var lib = el;
  while(lib.className.indexOf('lib mdl-card ') == -1 && lib.parentNode) lib = lib.parentNode;
  var path = lib.getAttribute('data-path');
  if(path.endsWith('.sqlite')) path = path.substring(0, path.lastIndexOf('/'));
  if(!path.endsWith('/')) path += '/';
  var flags = [];
  for(var i = 0; i < lib.attributes.length; i++) {
    var attr = lib.attributes[i];
    if(attr.name.startsWith('data-settings-') && lib.getAttribute(attr.name).toString() == 'true') {
      flags.push('--' + attr.name.substring('data-settings-'.length));
    }
  }
  currentSync = {path: path, flags: flags};
  messageUI.send('sync', currentSync);
  var dialog = document.getElementById('sync-dialog');
  document.getElementById('status').innerText = '';
  var tt = document.createElement('tt');
  tt.innerText = 'Syncing...';  
  document.getElementById('status').appendChild(tt);
  if(!dialog.showModal) dialogPolyfill.registerDialog(dialog);
  dialog.showModal();
  dialog.querySelector('#stop').removeEventListener('click', syncStop);  
  dialog.querySelector('#stop').addEventListener('click', syncStop);  
}

function syncStop() {
  var dialog = document.getElementById('sync-dialog');
  dialog.close();
}

function edit(event) {
  if(!event) event = window.event;
  var el = event.target || event.srcElement;
  var lib = el;
  while(lib.className.indexOf('lib mdl-card ') == -1 && lib.parentNode) lib = lib.parentNode;
  console.log(lib);
  var libpath = lib.getAttribute('data-path');
  if(libpath.endsWith('.sqlite')) libpath = libpath.substring(0, libpath.lastIndexOf('/'));
  if(!libpath.endsWith('/')) libpath += '/';
  console.log(libpath);
  var libSettings = document.querySelectorAll('.lib-settings');
  for(var i = 0; i < libSettings.length; i++) {
    var el = libSettings[i];
    var flagId = el.id.substring('lib-'.length); 
    var flag = document.getElementById(flagId);
    if(typeof flag != 'undefined' && flag != null) {
      flag.checked = false;
      flag.parentNode.className = flag.parentNode.className.replace(' is-checked', '');      
    }
    if(lib.getAttribute('data-' + flagId)) {
      if(lib.getAttribute('data-' + flagId).toString() == 'true') {
        flag.checked = true;
        flag.parentNode.className = flag.parentNode.className + ' is-checked';      
      }
    }
  }
  var dialog = document.getElementById('settings-dialog');
  dialog.setAttribute('data-lib', lib.id);
  if(!dialog.showModal) dialogPolyfill.registerDialog(dialog);
  dialog.showModal();
  dialog.querySelector('#ok').removeEventListener('click', editOk);
  dialog.querySelector('#ok').addEventListener('click', editOk);  
  dialog.querySelector('#cancel').removeEventListener('click', editCancel);
  dialog.querySelector('#cancel').addEventListener('click', editCancel);  
}

function editOk(event) {
  var dialog = document.getElementById('settings-dialog');
  var lib = document.getElementById(dialog.getAttribute('data-lib'));
  console.log(lib);
  for(var i in settings.libraries) {
    if(settings.libraries[i].path == lib.getAttribute('data-path')) {
      var libSettings = document.querySelectorAll('.lib-settings');
      console.log(libSettings);
      for(var j = 0; j < libSettings.length; j++) {
        var el = libSettings[j];
        console.log(el);
        var flagId = el.id.substring('lib-'.length); 
        var flag = document.getElementById(flagId);
        console.log(flagId);
        settings.libraries[i][flagId] = flag.checked;
      }
    }
  }
  saveSettings();
  dialog.close();
  showLibraries();
}

function editCancel(event) {
  var dialog = document.getElementById('settings-dialog');
  dialog.close();
}

function loadSettings(data) {
  console.log(data);
  if(data.data != '') settings = eval('(' + data.data + ')');
  if(!('libraries' in settings)) settings.libraries = [];
  showLibraries();  
}

function saveSettings() {
  messageUI.send('saveSettings', settings);
}

function b64toarray(b64, buffer) {
  var raw = window.atob(b64);
  var n = raw.length;
  var a = new Uint8Array(new ArrayBuffer(n));
  for(var i = 0; i < n ; i++) {
    a[i] = raw.charCodeAt(i);
  }
  return buffer ? a.buffer : a;
}