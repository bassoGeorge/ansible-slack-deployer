#!/usr/bin/env node --harmony
///////////////////////////////////////////////////////////////////////////////
//                  Main runner for our notification system                  //
///////////////////////////////////////////////////////////////////////////////

var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var shelljs = require('shelljs');

var configFile = "config.json";

if (argv.configure) {
    console.log("We are getting ready to configure this tool");
    process.exit(0);
}


console.dir(argv);

try {
    var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
} catch (err) {
    console.log("Bad configuration file");
    console.log(err);
    process.exit(1);
}

console.log("We have loaded the configuration");
console.dir(config);
