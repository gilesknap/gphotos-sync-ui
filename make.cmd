@echo off
if not exist "win" (
  mkdir win
  cd win
  echo Downloading DeskGap...
  ..\wget -O deskgap.zip https://github.com/patr0nus/DeskGap/releases/download/v0.1.0/deskgap-v0.1.0-win32-ia32.zip
  7za e deskgap.zip
  del deskgap.zip
  rename DeskGap "gPhotos Sync"
  del "gPhotos Sync\resources\app\*.*"
  rename "gPhotos Sync\DeskGap.exe" "gPhotos Sync\gPhotos Sync.exe"
  cd ..
)
echo Building gPhotos Sync App...
cp -f package.json ".\win\gPhotos Sync\resources\app\package.json"
cp -f material.min.css ".\win\gPhotos Sync\resources\app\material.min.css"
cp -f material.min.js ".\win\gPhotos Sync\resources\app\material.min.js"
cp -f material.min.css.map ".\win\gPhotos Sync\resources\app\material.min.css.map"
cp -f material.min.js.map ".\win\gPhotos Sync\resources\app\material.min.js.map"
cp -f dialog-polyfill.js ".\win\gPhotos Sync\resources\app\dialog-polyfill.js"
cp -f dialog-polyfill.css ".\win\gPhotos Sync\resources\app\dialog-polyfill.css"
cp -f icons.woff2 ".\win\gPhotos Sync\resources\app\icons.woff2"
cp -f sql.js ".\win\gPhotos Sync\resources\app\sql.js"
cp -f gphotos-sync.js ".\win\gPhotos Sync\resources\app\gphotos-sync.js"
cp -f gphotos-sync-ui.js ".\win\gPhotos Sync\resources\app\gphotos-sync-ui.js"
cp -f gphotos-sync.css ".\win\gPhotos Sync\resources\app\gphotos-sync.css"
cp -f gphotos-sync.html ".\win\gPhotos Sync\resources\app\gphotos-sync.html"
cp -f gphotos.html ".\win\gPhotos Sync\resources\app\gphotos.html"
echo Done.
rem *** TODO: icon, pack ***
pause
exit

