#!/bin/sh

cd "`dirname "$0"`"
find . -name '.DS_Store' -type f -delete
cp -f package.json "./mac/gPhotos Sync.app/Contents/Resources/app/package.json"
cp -f material.min.css "./mac/gPhotos Sync.app/Contents/Resources/app/material.min.css"
cp -f material.min.js "./mac/gPhotos Sync.app/Contents/Resources/app/material.min.js"
cp -f material.min.css.map "./mac/gPhotos Sync.app/Contents/Resources/app/material.min.css.map"
cp -f material.min.js.map "./mac/gPhotos Sync.app/Contents/Resources/app/material.min.js.map"
cp -f icons.woff2 "./mac/gPhotos Sync.app/Contents/Resources/app/icons.woff2"
cp -f sql.js "./mac/gPhotos Sync.app/Contents/Resources/app/sql.js"
cp -f gphotos-sync.js "./mac/gPhotos Sync.app/Contents/Resources/app/gphotos-sync.js"
cp -f gphotos-sync-ui.js "./mac/gPhotos Sync.app/Contents/Resources/app/gphotos-sync-ui.js"
cp -f gphotos-sync.css "./mac/gPhotos Sync.app/Contents/Resources/app/gphotos-sync.css"
cp -f gphotos-sync.html "./mac/gPhotos Sync.app/Contents/Resources/app/gphotos-sync.html"
codesign --force --verbose -s "gPhotos Sync" "./mac/gPhotos Sync.app"
rm -f -R ~/Applications/gPhotos\ Sync.app
cp -f -R "./mac/gPhotos Sync.app" ~/Applications/gPhotos\ Sync.app
cd mac
zip -r "../../rel/gPhotos Sync.app.zip" "gPhotos Sync.app"

