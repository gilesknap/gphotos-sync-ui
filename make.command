#!/bin/sh

cd "`dirname "$0"`"
find . -name '.DS_Store' -type f -delete
cp -f package.json "./mac/gPhotos Sync.app/Contents/Resources/app/package.json"
cp -f gphotos-sync.js "./mac/gPhotos Sync.app/Contents/Resources/app/gphotos-sync.js"
cp -f gphotos-sync.css "./mac/gPhotos Sync.app/Contents/Resources/app/gphotos-sync.css"
cp -f gphotos-sync.html "./mac/gPhotos Sync.app/Contents/Resources/app/gphotos-sync.html"
codesign --force --verbose -s "gPhotos Sync" "./mac/gPhotos Sync.app"
rm -f -R ~/Applications/gPhotos\ Sync.app
cp -f -R "./mac/gPhotos Sync.app" ~/Applications/gPhotos\ Sync.app
cd mac
zip -r "../../rel/gPhotos Sync.app.zip" "gPhotos Sync.app"

