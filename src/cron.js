module.exports = function (settings, bot, listingsDB) {
    var cron = require('node-cron');
    console.log('Cron jobs started');

    cron.schedule('* * * * *', function () {
        listingsDB.getOldListings(settings.post_removal_time).then(function (items) {
            if (items.length !== 0) {
                console.log('Old listings: ' + items.length);

                for (const i in items) {
                    if (items.hasOwnProperty(i)) {
                        removeListing(items[i]);
                    }
                }
            }
        }).catch(function (err) {
            console.error(err);
        });
    });

    function removeListing(item) {
        bot._api('chat.delete', {ts: item.ts, channel: item.channel}).then(function () {
            console.log('Old listing message removed');
            listingsDB.removeListing(item);
        });
    }
};
