///////////////////////////////////////////////////////////////////////////////
//                         The main deployment runner                        //
///////////////////////////////////////////////////////////////////////////////

var inquirer = require('inquirer');

var SlackAPI = require('./slack-api');
var Ansible = require("./ansible");

var out = require('./output');

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
        options.dryRun,
        options.verbose
    );

    var finalCommand = ansible.buildCommand(
        host.id,
        branch,
        options.tags,
        options.extraVars,
        options.vaultKeyFile
    );


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
        out.enhanced(finalCommand);

        return inquirer.prompt([{
            name: "description",
            message: "Enter optional description (CTRL-C to abort):",
            default: null
        }]);

    }).then(function(answers){
        out.info("Starting the process.");

        if (options.slack) {
            out.info("Making the slack announcement...");

            // Make the slack announcement
            return slackApi.announceDeployment(
                host.pretty,
                branch,
                options.tags,
                options.extraVars,
                options.delay,
                answers.description
            ).then(function(){
                out.success("Announcement complete");
                return true;
            });

        } else return true;

    }).then(function() {
        if (options.slack) {
            // Now we delay the execution, pretty neat trick you see
            out.info("Delaying execution for "+options.delay+" minutes");

            return delayExecution(options.delay * 60);
        } else return true;

    }).then(function(){
        if (options.slack) {
            return slackApi.warnStart(host.pretty);
        } else return true;

    }).then(function(){
        out.info("Running Ansible Deployment...");
        return ansible.run(finalCommand);

    }).then(function() {
        out.success("Deployment completed successfully");
        return true;

    }, function(err) {
        out.error("Ansible failed :(");
        console.log(err);
        return false;

    }).then(function(res) {
        if (options.pauseForManual && options.slack && res) {
            return slackApi.pauseInfo();
        } else return res;
    }).then(function(res){
        if (options.pauseForManual && res) {
            return inquirer.prompt([{
                name: "manual",
                message: "Ansible deployment complete. Please confirm manual process completion: ",
                type: "confirm"
            }]).then(function(ans){
                return ans.manual;
            });
        } else return res;
    }).then(function(res){
        if(options.slack) {
            if (res) {
                return slackApi.success(host.pretty);
            } else {
                return slackApi.failure(host.pretty);
            }
        } else return true;
    }).then(function(){
        process.exit(0);
    });
};
