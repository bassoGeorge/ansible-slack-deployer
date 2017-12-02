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
    .version('0.0.1')
    .option('--configure', 'Build the configuration')
    .option('-t, --tags <tags>', 'Tags to deploy with (defaults to all)', coercion.list)
    .option('-e, --extra-vars <vars>', 'A space separated key=value pairs of extra ansible vars', coercion.spaceSepKeyVals)
    .option('-d, --delay [minutes]', 'Add a delay of <minutes>, defaults to 5', coercion.numeric)
    .option('-k, --vault-key-file <vault pass file>', 'Provide the vault file')
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

// Now for some defaults
program.delay = program.delay || 5;

module.exports = {
    host: host,
    branch: branch,
    options: program
};
