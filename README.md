# Ansible Slack Deployer
A simple tool to run ansible deployments and post messages to slack about the progress.

### Installation
1. Clone the repository
2. Inside the cloned folder, run `npm install -g`. This will install the global command `ansible-slack`.

### Configuration
This tool requires a configuration file `ansible-slack.config.json` in the directory it runs. You should run
the tool in the ansible project directory holding the playbook file and `hosts/` directory.
To build a new configurtion, run `ansible-slack --configure` and follow the onscreen instructions.


### Usage
For usage help, run `ansible-slack -h`
