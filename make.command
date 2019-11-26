#!/bin/sh

cd "`dirname "$0"`"
find . -name '.DS_Store' -type f -delete
if [ ! -d "mac" ]
then
  mkdir mac
  cd mac
  echo Downloading DeskGap...
  curl -L https://github.com/patr0nus/DeskGap/releases/download/v0.1.0/deskgap-v0.1.0-darwin-x64.zip --output deskgap.zip
  unzip deskgap.zip
  rm deskgap.zip
  mv DeskGap.app gPhotos\ Sync.app
  rm -f gPhotos\ Sync.app/Contents/Resources/app/*
  mv "./gPhotos Sync.app/Contents/MacOS/DeskGap" "./gPhotos Sync.app/Contents/MacOS/gphotos-sync"
  cd ..
fi
echo Building gPhotos Sync App...
cp PkgInfo "./mac/gPhotos Sync.app/Contents/PkgInfo"
cp Info.plist "./mac/gPhotos Sync.app/Contents/Info.plist"
cp gphotos-sync.icns "./mac/gPhotos Sync.app/Contents/Resources"
cp -f package.json "./mac/gPhotos Sync.app/Contents/Resources/app/package.json"
cp -f material.min.css "./mac/gPhotos Sync.app/Contents/Resources/app/material.min.css"
cp -f material.min.js "./mac/gPhotos Sync.app/Contents/Resources/app/material.min.js"
cp -f material.min.css.map "./mac/gPhotos Sync.app/Contents/Resources/app/material.min.css.map"
cp -f material.min.js.map "./mac/gPhotos Sync.app/Contents/Resources/app/material.min.js.map"
cp -f dialog-polyfill.js "./mac/gPhotos Sync.app/Contents/Resources/app/dialog-polyfill.js"
cp -f dialog-polyfill.css "./mac/gPhotos Sync.app/Contents/Resources/app/dialog-polyfill.css"
cp -f icons.woff "./mac/gPhotos Sync.app/Contents/Resources/app/icons.woff"
cp -f sql.js "./mac/gPhotos Sync.app/Contents/Resources/app/sql.js"
cp -f gphotos-sync.js "./mac/gPhotos Sync.app/Contents/Resources/app/gphotos-sync.js"
cp -f gphotos-sync-ui.js "./mac/gPhotos Sync.app/Contents/Resources/app/gphotos-sync-ui.js"
cp -f gphotos-sync.css "./mac/gPhotos Sync.app/Contents/Resources/app/gphotos-sync.css"
cp -f gphotos-sync.html "./mac/gPhotos Sync.app/Contents/Resources/app/gphotos-sync.html"
cp -f gphotos.html "./mac/gPhotos Sync.app/Contents/Resources/app/gphotos.html"
#codesign --force --verbose -s "gPhotos Sync" "./mac/gPhotos Sync.app"
rm -f -R ~/Applications/gPhotos\ Sync.app
cp -f -R "./mac/gPhotos Sync.app" ~/Applications/gPhotos\ Sync.app
cd mac
#zip -r "../../rel/gPhotos Sync.app.zip" "gPhotos Sync.app"
echo Done.

