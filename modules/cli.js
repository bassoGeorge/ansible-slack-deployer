///////////////////////////////////////////////////////////////////////////////
//                      Setup the command line interface                     //
///////////////////////////////////////////////////////////////////////////////
var program = require('commander');

var coercion = {
    list: function(val) {
        return val.split(',');
    },
    spaceSepKeyVals: function(val) {
        var res = val.split(' ');
        res.forEach(function(v){
            if (!/^.*=.*$/.test(v)) {
                throw "extra vars must be space separated key=value pairs. got bad value: "+v;
            }
        });
        return res;
    },
    numeric: function(val) {
        return parseFloat(val);
    }
};

program
    .version('0.9.0')
    .description('Ansible deployer with slack integration.')
    .option('--configure', 'Build the configuration')
    .option('-t, --tags <tags>', 'Tags to deploy with (defaults to all)', coercion.list)
    .option('-e, --extra-vars <vars>', 'A space separated key=value pairs of extra ansible vars', coercion.spaceSepKeyVals)
    .option('-d, --delay [minutes]', 'Add a delay of <minutes>, defaults to 5', coercion.numeric)
    .option('-k, --vault-key-file <vault pass file>', 'Provide the vault file')
    .option('-p, --playbook <alternate playbook>', 'Provide alternate playbook to the one in configuration')
    .option('--no-slack', "Don't message on slack or wait")
    .option('--dry-run', "Don't do the deployment, just do an ansible --check run" )
    .option('--verbose', "Verbose output")
    .arguments('<host> [branch]')
    .parse(process.argv);

if (program.args.length == 0 && !program.configure) {
    console.error("No host given!");
    process.exit(1);
}

var host = program.args[0];
var branch = program.args[1]; // can be undefined

// Now for some defaults
program.delay = program.delay || 5;

module.exports = {
    host: host,
    branch: branch,
    options: program
};
