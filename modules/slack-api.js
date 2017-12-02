var axios = require('axios');

function SlackAPI(webhookUrl, user) {
    this.webhookUrl = webhookUrl;
    this.user = user || "Anish George";

    this.postMessage = function(data) {
        return axios.post(this.webhookUrl, data).then(function(response) {
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

    this.buildConfigAttachment = function(branch, tags, extraVars) {
        var fields = [];
        if (branch !== undefined) {
            fields.push({ title: "Branch", value: branch, short: true });
        }
        tags = tags || ["all"];
        fields.push({ title: "Tags", value: tags.join(", "), short: true });

        if (extraVars !== undefined) {
            fields.push({ title: "Other Variables", value: extraVars.join(", "), short: false });
        }
        return {
            fields: fields
        };
    };

    this.buildCommonFooter = function() {
        return {
            footer: "If any concerns, message "+this.user+"",
            mrkdwn_in: ["text"]
        };
    };


    this.announceDeployment = function(host, branch, tags, extraVars, timeRemaining) {
        var data = {
            text: "<!here> *"+this.user+"* will start deployment to  *"+host+"* soon",
            link_names: 1,
            attachments: [
                this.buildConfigAttachment(branch, tags, extraVars)
            ]
        };

        var footer = this.buildCommonFooter();
        footer.text = "*T-"+timeRemaining+"m* to deployment";
        footer.color = "warning";
        data.attachments.push(footer);

        return this.postMessage(data);
    };

    this.warnStart = function(host) {
        var data = {
            text: "<!here> Deployment to *"+host+"* commencing"
        };
        this.postMessage(data);
    };
}

module.exports = SlackAPI;
