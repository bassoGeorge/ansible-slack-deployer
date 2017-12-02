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
        fs.writeFile(configFile, JSON.stringify(json), 'utf8', function(err){
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}

module.exports = {
    load: function(){
        try {
            var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
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

        var questions = [
            {
                name: "user",
                message: "Enter your name",
                default: "Developer"
            },
            {
                name: "webhook",
                message: "Enter the webhook URL for posting messages to slack"
            },
            {
                name: "playbook",
                default: "site.yml",
                message: "Enter the default playbook to use for deployments"
            }
        ];

        var hosts = findHosts();
        var totalHosts = hosts.length;
        hosts.forEach(function(name, idx){
            questions.push({
                name: "hosts."+name,
                default: name,
                message: "Host Configuration ["+(idx+1)+"/"+totalHosts+"], Enter formal name for "+name
            });
        });

        inquirer.prompt(questions).then(function(answers){
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
            var hosts = result.hosts;
            var formatted = Object.keys(hosts).map(function(k){
                return { id: k, pretty: hosts[k] };
            });
            result.hosts = formatted;
            return saveConfig(result);
        });
    }
};
