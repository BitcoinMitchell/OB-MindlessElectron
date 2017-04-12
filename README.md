Mindless Electron for OpenBazaar Slack
========

OB-MindlessElectron is a bot specially written for the [OpenBazaar Slack team](https://openbazaar.slack.com/).

[![Dependency Status](https://gemnasium.com/badges/github.com/BitcoinMitchell/OB-MindlessElectron.svg)](https://gemnasium.com/github.com/BitcoinMitchell/OB-MindlessElectron) [![Greenkeeper badge](https://badges.greenkeeper.io/BitcoinMitchell/OB-MindlessElectron.svg)](https://greenkeeper.io/)

## Requirements
Mindless Electron has to be installed on a server running a fully working OpenBazaar server that is able to restart itself when it hangs/has issues of any kind. It future requires a set of NPM packages, which can be found in [package.json](../master/package.json). 

## Supported functions
Mindless Electron is currently able to do the follow things:
* Parse ob:// links
   * Any `ob://` link that is posted to a supported channel (a channel in which MindlessElectron resides) will be parsed and information about said link will be displayed. 

### Examples
------
* Parsing
   * [Store](http://i.imgur.com/MhA8KFM.png "An OB:// store link being parse")
   * [Listing](http://i.imgur.com/qll3J2m.png "An OB:// listing link being parse")
