///////////////////////////////////////////////////////////////////////////////
//                             Outputting module                             //
///////////////////////////////////////////////////////////////////////////////

var chalk = require('chalk');

module.exports = {
    warn: function(message) {
        console.log(chalk.yellow(message));
    },
    error: function(message) {
        console.log(chalk.red.bold(message));
    },
    success: function(message) {
        console.log(chalk.green.bold(message));
    },
    info: function(message) {
        console.log(chalk.cyan(message));
    }
};
