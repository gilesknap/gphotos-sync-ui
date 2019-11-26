# gphotos-sync-ui

Graphical User Interface for the great gphotos-sync tool using node and DeskGap

*Under developement - Not working yet*

## Download

The app is not yet available for download

## Requirements

* python - on Windows, [download from here](https://www.python.org/ftp/python/3.6.8/python-3.6.8.exe)
* gphotos-sync

## Testing

### macOS

* Download or clone the project
* Run `make.command` script (make executable if necessary using `chmod +x make.command`)
* The app is copied to `~/Applications` folder
* Dependencies: none

### Linux (untested)

* Download or clone the project
* Run `make.sh` script (make executable if necessary using `chmod +x make.sh`)
* The app is compressed as `../gPhotos Sync.zip` and also available in `linux/gPhotos Sync` folder
* Dependencies: none

### Windows (not working)

* Download or clone the project
* Run `make.cmd` script
* The app is packed as `../gPhotos Sync.exe` (_fake news_) and also available in `win/gPhotos Sync` folder
* Dependencies:
  * wget - [download from here](https://eternallybored.org/misc/wget/1.20.3/32/wget.exe) and copy to the same folder containing make.cmd
  * unzip - [download from here](https://sourceforge.net/projects/unigw/files/unzip/5.50/unzip.exe/download) and copy unzip.exe to the same folder containing make.cmd 

## Project status

Done

* add existing library
* sync with default settings
* sync favorites only

Todo

* create new library
* implement all gphotos-sync settings
* ui for credentials

![](gphotos-sync-ui-1.png)
![](gphotos-sync-ui-2.png)
![](gphotos-sync-ui-3.png)

## Related projects

* gphotos-sync https://github.com/gilesknap/gphotos-sync
* DeskGap https://github.com/patr0nus/DeskGap

## Recommended tools

* https://www.xnview.com/fr/xnviewmp