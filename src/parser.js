module.exports = function (bot, functions) {
    bot.on('start', function () {
        console.log('The bot has connected to Slack!');
    });

    bot.on('end', function () {
        console.log('The bot got disconnected from Slack!');
    });

    bot.on('message', function (data) {
        if (data.type === 'message' && data.text != null && data.text.indexOf('ob://') >= 0) {
            functions.parseOBLinks(data)
        }
    });
};