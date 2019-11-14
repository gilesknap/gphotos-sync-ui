/* gphotos-sync-ui.js */

window.addEventListener('load', function() {
  document.getElementById('menu-sync').addEventListener('click', switchPage);
  document.getElementById('menu-settings').addEventListener('click', switchPage);
  document.getElementById('menu-log').addEventListener('click', switchPage);
  document.getElementById('menu-about').addEventListener('click', switchPage);
});

var currentPage = 'sync';

function switchPage(event) {
  var el = event.target;
  if(currentPage != '') document.getElementById(currentPage).style.display = 'none';
  currentPage = el.id.replace('menu-', '');
  document.getElementById(currentPage).style.display = 'block';
  document.querySelector('.mdl-layout__obfuscator').click();
}