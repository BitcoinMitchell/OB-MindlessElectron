module.exports = function(bot, functions, group) {
  bot.on('start', function() {
    winston.info(bot.name + ' has connected to Slack (' + group.name + ')');
  });

  bot.on('end', function() {
    winston.info(bot.name + ' has disconnected from ' + group.name);
  });

  bot.on('message', function(data) {
    if (data.type === 'message' && data.text != null && data.text.indexOf('ob://') >= 0) {
      functions.parseOBLinks(data)
    }
  });
};
