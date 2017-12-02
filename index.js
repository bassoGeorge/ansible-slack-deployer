#!/usr/bin/env node
///////////////////////////////////////////////////////////////////////////////
//                  Main runner for our notification system                  //
///////////////////////////////////////////////////////////////////////////////

var SlackAPI = require('./modules/slack-api');
var Ansible = require("./modules/ansible");


/* -------- Setup commandline ------------- */
var cli = require('./modules/cli');
var options = cli.options;
/* ---------------------------------------- */

/* -------- Setup configuration ----------- */
var configHandler = require('./modules/config-handler');

if (options.configure) {
    // Logic to build config and exit
}

var config = configHandler.load();
/* ---------------------------------------- */

var hostPretty = config.hosts[cli.host] || cli.host;
/* TODO: add other error handling for various missing configurations */

var slackApi = new SlackAPI(config.webhook, config.user);
var ansible = new Ansible('site.yml', 'local', true);

var finalCommand = ansible.buildCommand(
    'local',
    cli.branch,
    options.tags,
    options.extraVars,
    options.vaultKeyFile
);

function logAndIgnoreSlackError(err) {
    console.log("We are having trouble with slack")
    console.error(err);
    return false;
}

function delayExecution(seconds) {
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            resolve(true)
        }, seconds * 1000);
    })
}

// We use the almighty promise instead of the inferior callback
// Start of with a resolved promise just to make things readable
// and refactorable
Promise.resolve(true).then(function(){
    console.log("Ansible command to run: ");
    console.log(finalCommand);
    console.log("You have 5 seconds to abort (CTRL-C)")
    return delayExecution(5);

}).then(function(){
    console.log("Starting the process. Making the slack announcement...")

    // Make the slack announcement
    return slackApi.announceDeployment(
        hostPretty,
        cli.branch,
        options.tags,
        options.extraVars,
        options.delay

    );

}).then(function(){
    console.log("Announcement complete")
    return true;

}).catch(
    logAndIgnoreSlackError

).then(function() {
    // Now we delay the execution, pretty neat trick you see
    console.log("Delaying execution for "+options.delay+" minutes");

    return delayExecution(options.delay * 60);

}).then(function(){
    return slackApi.warnStart(hostPretty)

}).catch(
    logAndIgnoreSlackError

).then(function(){
    return ansible.run(finalCommand);

}).then(function() {
    console.log("Deployment completed successfully")
    return slackApi.success();

}, function(err) {
    console.log("Ansible failed :(")
    console.log(err);
    return slackApi.failure();

}).catch(
    logAndIgnoreSlackError

).then(function(){
    process.exit(0);
})
