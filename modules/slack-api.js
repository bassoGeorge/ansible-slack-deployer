var axios = require('axios');

function SlackAPI(webhookUrl) {
    this.webhookUrl = webhookUrl;

    this.postMessage = function(data) {
        axios.post(this.webhookUrl, data).then(function(response) {
            console.log("we finished that call");
            console.log(response);
        }).catch(function(error){
            console.log("we had a problem");
            console.log(error);
        });
    };

    this.test = function() {
        this.postMessage({
            text: "@here deployment to *Prod* commencing soon",
            attachments: [{
                text: "Configuration",
                fields: [
                    { title: "branch", value: "master", short: true },
                    { title: "tags", value: "code,config,db_migrations", short: true },
                ]
            }, {
                text: "Time remaining: 1minute",
                color: "warning"
            }]
        });
    };


    this.warnStart = function(host, branch, tags, extraVars) {
        var fields = [];
        if (branch !== undefined) {
            fields.push({ title: "Branch", value: branch, short: true });
        }
        tags = tags || ["all"];
        fields.push({ title: "Tags", value: tags.join(", "), short: true });

        if (extraVars !== undefined) {
            fields.push({ title: "Other Variables", value: extraVars.join(", "), short: false });
        }

        var data = {
            text: "@here deployment to *"+host+"* commencing soon",
            attachments: [{
                fields: fields
            }]
        };

        this.postMessage(data);
    };
}

module.exports = SlackAPI;
