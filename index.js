#!/usr/bin/env node
///////////////////////////////////////////////////////////////////////////////
//                  Main runner for our notification system                  //
///////////////////////////////////////////////////////////////////////////////

var fs = require('fs');
var shelljs = require('shelljs');
var SlackAPI = require('./modules/slack-api');

var configFile = "deployment-notif.config.json";

/* -------- Setup commandline ------------- */
var cli = require('./modules/cli');
var options = cli.options;
/* ---------------------------------------- */


try {
    var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
} catch (err) {
    console.log("Bad configuration file");
    console.log(err);
    process.exit(1);
}
/* TODO: add other error handling for various missing configurations */

var api = new SlackAPI(config.webhook, config.user);

var hostPretty = config.hosts[cli.host] || cli.host;

// api.test();
api.announceDeployment(hostPretty, cli.branch, options.tags, options.extraVars, options.delay).then(function(){
    console.log("Slack announcement complete");
});

console.log("Now waiting for "+options.delay+" minutes before proceding with deployment");

setTimeout(function(){
    api.warnStart(hostPretty);
}, 1000 * 60 * options.delay)
