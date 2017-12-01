#!/usr/bin/env node
///////////////////////////////////////////////////////////////////////////////
//                  Main runner for our notification system                  //
///////////////////////////////////////////////////////////////////////////////

var program = require('commander');
var fs = require('fs');
var shelljs = require('shelljs');
var SlackAPI = require('./modules/slack-api');

var configFile = "deployment-notif.config.json";

/* -------- Setup commandline ------------- */
var coercion = {
    list: function(val) {
        return val.split(',')
    },
    spaceSepKeyVals: function(val) {
        var res = val.split(' ');
        res.forEach(function(v){
            if (!/^.*=.*$/.test(v)) {
                throw "extra vars must be space separated key=value pairs. got bad value: "+v;
            }
        })
        return res;
    }
}
program
    .version('0.0.1')
    .option('--configure', 'Build the configuration')
    .option('-t, --tags <tags>', 'Tags to deploy with (defaults to all)', coercion.list)
    .option('-e, --extra-vars <vars>', 'A space separated key=value pairs of extra ansible vars', coercion.spaceSepKeyVals)
    .arguments('<host> [branch]')
    .parse(process.argv);

if (program.configure) {
    console.log("We are getting ready to configure this tool");
    process.exit(0);
} else if (program.args.length == 0) {
    console.error("No host given!");
    process.exit(1);
}

var host = program.args[0];
var branch = program.args[1]; // can be undefined
/* ---------------------------------------- */


try {
    var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
} catch (err) {
    console.log("Bad configuration file");
    console.log(err);
    process.exit(1);
}
/* TODO: add other error handling for various missing configurations */

// DEBUG
// console.log("configuration: ");
// console.log(config);

// console.log(program.tags);
// console.log(program.extraVars);

var api = new SlackAPI(config.webhook);

// api.test();
api.warnStart(
    config.hosts[host] || host,
    branch, program.tags, program.extraVars);
