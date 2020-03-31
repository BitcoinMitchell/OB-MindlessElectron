require('./src/functions/winston');

const args = require('./src/arguments.js')();
const settings = require('./src/settings.js')(args);
const database = require('./src/database/listings.js')(settings);

//-=-=-=-=-=- More includes -=-=-=-=-=-//
const SlackBot = require('slackbots');

settings.slack.groups.forEach(function(group) {
  const bot = new SlackBot({token: group.token, name: group.bot_name});

  const functions = require('./src/functions/functions.js')(settings, bot, database);
  require('./src/cron.js')(settings, bot, database);
  require('./src/parser.js')(bot, functions, group);
});
