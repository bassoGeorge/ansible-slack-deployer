var fs = require('fs');
var SlackAPI = require('./modules/slack-api');

var configFile = "deployment-notif.config.json";
var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

var slackApi = new SlackAPI(config.webhook, config.user);
slackApi.test();
