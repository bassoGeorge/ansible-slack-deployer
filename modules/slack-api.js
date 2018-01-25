var axios = require('axios');
var out = require('./output');


function SlackAPI(webhookUrl, user, verbose) {
    this.webhookUrl = webhookUrl;
    this.user = user || "Anish George";
    this.verbose = verbose;

    this.postMessage = function(data) {
        return axios.post(this.webhookUrl, data).then(
            function() { return true; },
            function(err){
                out.warn("Slack failed");
                if (verbose) {
                    out.error(err);
                }
                return false;
            }
        );
    };

    this.test = function() {
        return this.postMessage({
            attachments: [{
                title: "Deployment Announcement",
                text: "<!here> Configuration",
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

    this.commonAttachment = function(){
        return {
            mrkdwn_in: ["text"]
        };
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

        return Object.assign(this.commonAttachment(), {
            fields: fields
        });
    };

    this.buildCommonFooter = function() {
        return Object.assign(this.commonAttachment(), {
            footer: "If any concerns, message "+this.user+""
        });
    };


    this.announceDeployment = function(host, branch, tags, extraVars, timeRemaining, desc) {
        var data = {
            text: "<!here> *"+this.user+"* will start deployment to *"+host+"* soon",
            attachments: [
                Object.assign(
                    this.buildConfigAttachment(branch, tags, extraVars),
                    {
                        text: desc ? "_"+desc+"_" : null
                    }
                ),
                Object.assign(
                    this.buildCommonFooter(),
                    {
                        text: "*"+timeRemaining+" mins* to deployment",
                        color: "warning"
                    }
                )
            ]
        };

        return this.postMessage(data);
    };

    this.announceDeployment_fake = function() {
        return Promise.reject("gotcha");
    };

    this.warnStart = function(host) {
        var data = {
            text: "commencing deployment to *"+host+"*"
        };
        return this.postMessage(data);
    };
    this.pauseInfo = function() {
        var data = {
            text: "deployment paused for some manual scripts..."
        };
        return this.postMessage(data);
    };

    this.endMessage = function(attachment) {
        var data = {
            attachments: [
                Object.assign(this.commonAttachment(), attachment)
            ]
        };
        return this.postMessage(data);
    };


    this.success = function(host) {
        return this.endMessage({
            text: "<!here> Deployment to *"+host+"* succeded. QA please verify",
            color: "good"
        });
    };

    this.failure = function(host) {
        return this.endMessage({
            text: "<!here> Deployment to *"+host+"*failed!. Please notify "+this.user+" if he/she not already on it.",
            color: "danger"
        });
    };
}

module.exports = SlackAPI;
