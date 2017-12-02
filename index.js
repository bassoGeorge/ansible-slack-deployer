#!/usr/bin/env node
///////////////////////////////////////////////////////////////////////////////
//                  Main runner for our notification system                  //
///////////////////////////////////////////////////////////////////////////////

/* -------- Setup commandline ------------- */
var cli = require('./modules/cli');
var options = cli.options;
/* ---------------------------------------- */

/* -------- Setup configuration ----------- */
var configHandler = require('./modules/config-handler');

if (options.configure) {
    // Logic to build config and exit
    console.log("We should be running an interactive configuration builder ryt now:");
    process.exit(2);
} else {
    console.log("cli host: "+cli.host);
    var config = configHandler.load();
    var host = config.hosts.find(function(host){
        return host.id == cli.host;
    })
    if (!host) {
        console.error("Uknown host provided: "+host);
        console.log("Available hosts are: " +
                    config.hosts.map(function(item, idx){
                        return item.name
                    }).join(', ')
                   )
        process.exit(1);
    }
    var depRunner = require('./modules/deployment-runner');
    depRunner(host, cli.branch, options, config);
}
/* ---------------------------------------- */

