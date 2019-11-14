/* gphotos-sync-ui.js */

var asyncNode = window.deskgap.asyncNode;
var messageUI = window.deskgap.messageUI;
var currentDB = {};
var settings = {};
var currentPage = 'sync';

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
  console.log(data);
  data.path = data.result[0];
  delete data.options;
  delete data.result;
  data.callback = 'loadDatabase';
  messageUI.send('readFileSync', data);
}

function loadDatabase(db) {
  console.log(db);
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
    lib.setAttribute('class', 'lib mdl-card mdl-shadow--2dp');
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
    action2.innerText = 'Remove';
    title.appendChild(h2);
    lib.appendChild(title);
    lib.appendChild(content);
    actions.appendChild(action1);
    actions.appendChild(action2);
    lib.appendChild(actions);       
    document.getElementById('sync-libraries').appendChild(lib);
  }
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