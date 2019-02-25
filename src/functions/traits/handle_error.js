/**
 * This module contains all the Openbazaar related calls
 *
 * @module traits
 */

module.exports = function(bot, settings) {
  return function(channel, error) {
    const basicMessage = {
      text: '_The bot encountered an issue:_',
      icon_emoji: ':ob1:',
      username: bot.name,
      channel: channel,
      attachments: [{
        'mrkdwn_in': ['footer', 'text'],
        'footer': ':ob1: This post will be removed in ' + settings.post_removal_time_readable + ' minutes.'
      }],
    };

    if (error.message.includes('Error: ESOCKETTIMEDOUT')) {
      basicMessage.attachments[0].text = 'The listing could not be found or retrieved';

      return basicMessage;
    }

    // We had all the innocent cases
    winston.error(error);

    if (error.message.includes('500 -')) {
      basicMessage.attachments[0].text = 'The OB1 server returned an invalid response: \n' +
        '`' + error.response.body.reason + '`';

      return basicMessage;
    }

    basicMessage.attachments[0].text = 'Something broke';

    return basicMessage;
  }
};
