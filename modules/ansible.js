var shell = require('shelljs');

function Ansible(playbook, localHost, dryRun) {
    this.localHost = localHost;
    this.dryRun = Boolean(dryRun);
    this.playbook = playbook || "site.yml";

    this.buildCommand = function(host, branch, tags, extraVars, vaultFilePath) {
        var command = "ansible-playbook "+this.playbook;
        if (this.localHost == host) {
            command += " -c local";
        }
        if (this.dryRun) {
            command += " --check";
        }

        command += " -i hosts/" + host;
        if (tags.length > 0) {
            command += " -t " + tags.join(',');
        }

        extraVars = extraVars || [];
        extraVars.push("branch="+branch);

        var actualExtraVars = extraVars.join(' ');
        if (actualExtraVars.length > 0) {
            command += ' --extra-vars="' + actualExtraVars + '"';
        }

        if (vaultFilePath) {
            command += ' --vault-password-file=' + vaultFilePath;
        }
        return command;
    };

    this.run = function(command) {
        return new Promise(function(resolve, reject) {
            shell.exec(command, function(code, stdout, stderr){
                if (code !== 0) {
                    reject(stderr);
                } else {
                    resolve(stdout);
                }
            });
        });
    };
}

module.exports = Ansible;
