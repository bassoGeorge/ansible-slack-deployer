///////////////////////////////////////////////////////////////////////////////
//                         Handling the configuration                        //
///////////////////////////////////////////////////////////////////////////////

var fs = require('fs');

var configFile = "deployment-notif.config.json";
var hostPath = "./hosts/";

function findHosts() {
    if (!fs.existsSync(hostPath)) {
        console.error("Cannot find hosts/ folders in current directory. This tool may not work correctly");
        return [];
    }
    return fs.readdirSync(hostPath);
};

function saveConfig(json) {
    return new Promise(function(resolve, reject){
        fs.writeFile(configFile, JSON.stringify(json, null, 4), 'utf8', function(err){
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}

// This one throws pretty bad. always inside a try/catch. Intentialy not checking for existing file or not to make code easier
function getConfig(){
    return JSON.parse(fs.readFileSync(configFile, 'utf8'));
}

module.exports = {
    load: function(){
        try {
            var config = getConfig();
        } catch (err) {
            console.log("Bad or missing configuration file");
            console.log(err);
            process.exit(1);
        }
        return config;
    },

    save: saveConfig,

    build: function() {
        var inquirer = require('inquirer');

        // Step 0: Retrieve any existing config to provide default values
        var oldConfig = {};
        try {
            oldConfig = getConfig();
        } catch (err) {}

        // Step 1: Basics
        var questions = [
            {
                name: "user",
                message: "Enter your name",
                default: oldConfig.user || "Developer"
            },
            {
                name: "webhook",
                message: "Enter the webhook URL for posting messages to slack",
                default: oldConfig.webhook
            },
            {
                name: "playbook",
                default: oldConfig.playbook || "site.yml",
                message: "Enter the default playbook to use for deployments"
            }
        ];

        // Step 2.a: Get formal names for the different hosts
        var hosts = findHosts();
        var totalHosts = hosts.length;
        hosts.forEach(function(name, idx){
            questions.push({
                name: "hosts."+name,
                default: ((oldConfig.hosts || []).find(function(item){ return item.id == name; }) || {}).pretty || name,
                message: "Host Configuration ["+(idx+1)+"/"+totalHosts+"], Enter formal name for "+name
            });
        });


        // Step 2.b: Determine the current host

        var hostDefault = hosts.indexOf("localy") + 1;
        // The +1 is genius. choices will have "none" prepended.
        // If -1, then "none" else will be correct index for "local" in the final choices
        var choices = ["none"].concat(hosts);

        questions.push({
            name: "current_host",
            type: "list",
            default: oldConfig.current_host ? choices.indexOf(oldConfig.current_host) : hostDefault,
            choices: choices,
            message: "Select the host on which this ansible project is setup"
        });

        // Step 3: Let's get this show on the road!
        inquirer.prompt(questions).then(function(answers){
            var hosts = answers.hosts;
            var formatted = Object.keys(hosts).map(function(k){
                return { id: k, pretty: hosts[k] };
            });
            answers.hosts = formatted;

            console.log("Thats it, let's take a moment to review, here is your data");
            console.log(answers);

            return Promise.all([
                Promise.resolve(answers),
                inquirer.prompt([{
                    name: "confirm",
                    message: "Does this look good?",
                    type: "confirm",
                    default: true
                }])
            ]);
        }).then(function(comb){
            var confirmation = comb[1].confirm;
            if (!confirmation) {
                return Promise.reject(false);
            } else {
                return comb[0];
            }
        }).then(function(result){
            return saveConfig(result);
        }, function(){
            console.log("Operation cancelled!");
        });
    }
};
