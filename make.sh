#!/bin/sh

cd "`dirname "$0"`"
find . -name '.DS_Store' -type f -delete
if [ ! -d "linux" ]
then
  mkdir linux
  cd linux
  echo Downloading DeskGap...
  curl -L https://github.com/patr0nus/DeskGap/releases/download/v0.1.0/deskgap-v0.1.0-linux-x64.zip --output deskgap.zip
  unzip deskgap.zip
  rm deskgap.zip
  mv "./DeskGap" "./gPhotos Sync"
  rm -f "/gPhotos Sync/resources/app/*"
  mv "./DeskGap/DeskGap" "./gPhotos Sync"
  chmod +x "./gPhotos Sync/gPhotos Sync"
  cd ..
fi
echo Building gPhotos Sync App...
cp -f package.json "./linux/gPhoto Sync/resources/app/package.json"
cp -f material.min.css "./linux/gPhoto Sync/resources/app/material.min.css"
cp -f material.min.js "./linux/gPhoto Sync/resources/app/material.min.js"
cp -f material.min.css.map "./linux/gPhoto Sync/resources/app/material.min.css.map"
cp -f material.min.js.map "./linux/gPhoto Sync/resources/app/material.min.js.map"
cp -f dialog-polyfill.js "./linux/gPhoto Sync/resources/app/dialog-polyfill.js"
cp -f dialog-polyfill.css "./linux/gPhoto Sync/resources/app/dialog-polyfill.css"
cp -f icons.woff2 "./linux/gPhoto Sync/resources/app/icons.woff2"
cp -f sql.js "./linux/gPhoto Sync/resources/app/sql.js"
cp -f gphotos-sync.js "./linux/gPhoto Sync/resources/app/gphotos-sync.js"
cp -f gphotos-sync-ui.js "./linux/gPhoto Sync/resources/app/gphotos-sync-ui.js"
cp -f gphotos-sync.css "./linux/gPhoto Sync/resources/app/gphotos-sync.css"
cp -f gphotos-sync.html "./linux/gPhoto Sync/resources/app/gphotos-sync.html"
cp -f gphotos.html "./linux/gPhoto Sync/resources/app/gphotos.html"
cd linux
zip -r "../../gPhoto Sync.zip" *
echo Done.

