var arguments = require('./src/arguments.js')();
var settings = require('./src/settings.js')(arguments);
var listingsDB = require('./src/database/listings.js')(settings);

//-=-=-=-=-=- More includes -=-=-=-=-=-//
var SlackBot = require('slackbots');

settings.slack.groups.forEach(function (group) {
    var bot = new SlackBot({token: group.token, name: group.bot_name});

    var functions = require('./src/functions/functions.js')(settings, bot, listingsDB);
    require('./src/cron.js')(settings, bot, listingsDB);
    require('./src/parser.js')(bot, functions);
});