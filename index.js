#!/usr/bin/env node
///////////////////////////////////////////////////////////////////////////////
//                  Main runner for our notification system                  //
///////////////////////////////////////////////////////////////////////////////

var program = require('commander');
var fs = require('fs');
var shelljs = require('shelljs');

var configFile = "deployment-notif.config.json";

/* -------- Setup commandline ------------- */
program
    .version('0.0.1')
    .option('-c, --configure', 'Build the configuration')
    .parse(process.argv);
/* ---------------------------------------- */

if (program.configure) {
    console.log("We are getting ready to configure this tool");
    process.exit(0);
}

try {
    var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
} catch (err) {
    console.log("Bad configuration file");
    console.log(err);
    process.exit(1);
}

// DEBUG
console.log("configuration: ");
console.log(config);

