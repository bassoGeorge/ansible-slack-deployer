///////////////////////////////////////////////////////////////////////////////
//                         Handling the configuration                        //
///////////////////////////////////////////////////////////////////////////////

var fs = require('fs');
var configFile = "deployment-notif.config.json";

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
    }
};
