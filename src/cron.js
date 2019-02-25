module.exports = function(settings, bot, database) {
  var cron = require('node-cron');
  winston.info('Cron jobs started');

  cron.schedule('* * * * *', function() {
    database.getOldListings(settings.post_removal_time).then(function(items) {
      if (items.length !== 0) {
        winston.info('Old listings: ' + items.length);

        for (const i in items) {
          if (false === items.hasOwnProperty(i)) {
            continue;
          }

          removeListing(items[i]);
        }
      }
    }).catch(function(err) {
      winston.error(err);
    });
  });

  function removeListing(item) {
    bot._api('chat.delete', {ts: item.ts, channel: item.channel}).then(function() {
      winston.info('Old listing message removed');
      database.removeListing(item);
    });
  }
};
