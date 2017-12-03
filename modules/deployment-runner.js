///////////////////////////////////////////////////////////////////////////////
//                         The main deployment runner                        //
///////////////////////////////////////////////////////////////////////////////

var SlackAPI = require('./slack-api');
var Ansible = require("./ansible");

var output = require('./output');

/**
 * Main deployment runner, requires a couple of things
 * @param {Object<name, pretty>} host: The host information.
 * @param {string} branch: the target branch name, can be undefined.
 * @param {commander} options: The options from commander.
 * @param {Config} config: The configuration object.
 */
module.exports = function(host, branch, options, config) {

    var slackApi = new SlackAPI(config.webhook, config.user);
    var ansible = new Ansible(
        options.playbook || config.playbook || 'site.yml',
        config.current_host,
        options.dryRun
    );

    var finalCommand = ansible.buildCommand(
        host.id,
        branch,
        options.tags,
        options.extraVars,
        options.vaultKeyFile
    );

    function logAndIgnoreSlackError(err) {
        output.warn("We are having trouble with slack");
        console.log(err);
        return false;
    }

    function delayExecution(seconds) {
        return new Promise(function(resolve, reject){
            setTimeout(function(){
                resolve(true);
            }, seconds * 1000);
        });
    }

    // We use the almighty promise instead of the inferior callback
    // Start of with a resolved promise just to make things readable
    // and refactorable
    Promise.resolve(true).then(function(){
        console.log("Ansible command to run: ");
        console.log(finalCommand);
        output.warn("You have 5 seconds to abort (CTRL-C)");
        return delayExecution(5);

    }).then(function(){
        output.info("Starting the process. Making the slack announcement...");

        // Make the slack announcement
        return slackApi.announceDeployment(
            host.pretty,
            branch,
            options.tags,
            options.extraVars,
            options.delay

        );

    }).then(function(){
        output.success("Announcement complete");
        return true;

    }).catch(
        logAndIgnoreSlackError

    ).then(function() {
        // Now we delay the execution, pretty neat trick you see
        output.info("Delaying execution for "+options.delay+" minutes");

        return delayExecution(options.delay * 60);

    }).then(function(){
        return slackApi.warnStart(host.pretty);

    }).catch(
        logAndIgnoreSlackError

    ).then(function(){
        return ansible.run(finalCommand);

    }).then(function() {
        output.success("Deployment completed successfully");
        return slackApi.success(host.pretty);

    }, function(err) {
        output.error("Ansible failed :(");
        console.log(err);
        return slackApi.failure(host.pretty);

    }).catch(
        logAndIgnoreSlackError

    ).then(function(){
        process.exit(0);
    });
};
