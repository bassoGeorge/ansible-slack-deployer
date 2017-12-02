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


    this.announceDeployment = function(host, branch, tags, extraVars, timeRemaining) {
        var data = {
            text: "<!here> *"+this.user+"* will start deployment to  *"+host+"* soon",
            attachments: [
                this.buildConfigAttachment(branch, tags, extraVars),
                Object.assign(
                    this.buildCommonFooter(),
                    {
                        text: "*T-"+timeRemaining+"m* to deployment",
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
            text: "<!here> commencing deployment to *"+host+"*"
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

    this.success = function() {
        return this.endMessage({
            text: "<!here> Deployment succeded. QA please verify",
            color: "good"
        });
    };

    this.failure = function() {
        return this.endMessage({
            text: "<!here> Deployment failed!. Please notify "+this.user+" if he/she not already on it.",
            color: "danger"
        });
    };
}

module.exports = SlackAPI;
