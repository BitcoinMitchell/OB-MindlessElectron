/**
 * This module contains all the Openbazaar related calls
 *
 * @module traits
 */

module.exports = function(slack, bot, settings, database) {
  const Promise = require('promise'),
    mrkdwn = require('html-to-mrkdwn'),
    request = require('request-promise'),
    handle_error = require('./handle_error')(bot, settings);

  function parseOBLinks(data) {
    const routeArray = data.text.replace('>', '').replace('<', '').split('ob://')[1].replace(/ /g, '').split('/');
    const channel = data.channel;

    const storeId = routeArray[0], itemHash = routeArray[2];
    if (null === storeId || null === itemHash || '' === storeId || '' === itemHash)
      return;

    slack.preProcessGH(storeId).then(function(storeId) {
      return processOBLink(storeId, itemHash, channel)
    }).then(function(botResponse) {
      return bot._api('chat.postMessage', botResponse)
    }).then(function(message) {
      return database.insertListing(message).then(function() {
        winston.info('Listing message posted and inserted')
      });
    }).catch(function(error) {
      winston.error(error);
    })
  }

  function processOBLink(guid, itemHash, channel) {
    return new Promise(function(resolve, reject) {
      if (guid != null && itemHash == null) {
        return processUserLink(guid, channel).then(function(data) {
          resolve(data)
        }).catch(function(error) {
          reject(error)
        })
      }

      if (guid != null && itemHash != null) {
        return processItemLink(guid, itemHash, channel).then(function(data) {
          resolve(data)
        }).catch(function(error) {
          reject(error)
        })
      }

      return reject();
    })
  }

  function processUserLink(guid, channel) {
    return new Promise(function(resolve) {
      const url = 'https://gateway.ob1.io/ob/profile/' + guid + '?usecache=true';
      request.get({url: url, json: true, timeout: 2000}).then(function(profile) {
        if (false === profile.success) {
          return resolve(handle_error(channel, profile));
        }

        const description = mrkdwn(profile.shortDescription).text.replace(/\*\*/g, '*')
          + '\n\n*Moderator*: ' + ((profile.moderator) ? 'Yes' : 'No');

        const avatarHashes = typeof profile.avatarHashes !== 'undefined'
          ? profile.avatarHashes
          : profile.headerHashes;

        resolve({
          icon_emoji: ':ob1:',
          attachments: [{
            'mrkdwn_in': ['footer', 'text'],
            'title': 'User: ' + profile.name,
            'title_link': 'https://openbazaar.com/store/home/' + guid,
            'text': description,
            'image_url': 'https://gateway.ob1.io/ob/images/' + avatarHashes.small,
            'thumb_url': 'https://gateway.ob1.io/ob/images/' + avatarHashes.small,
            'footer': 'This post will be removed in ' + settings.post_removal_time_readable + ' minutes.',
            'footer_icon': "https://avatars.slack-edge.com/2016-04-18/35680932023_f9e79dc3f27210589e89_48.png"
          }],
          channel: channel,
          username: bot.name
        })
      }).catch(function(err) {
        return resolve(handle_error(channel, err));
      });
    })
  }

  function processItemLink(guid, itemHash, channel) {
    return new Promise(function(resolve) {
      const url = 'https://gateway.ob1.io/ob/listing/' + guid + '/' + itemHash + '?usecache=true';
      request.get({url: url, json: true, timeout: 2000}).then(function(body) {
        if (false === body.success) {
          return resolve(handle_error(channel, body));
        }

        const listing = body.listing;
        const metadata = listing.metadata;
        const item = listing.item;

        const price = parseFloat(item.price / 100).toFixed(2) + metadata.pricingCurrency;
        const item_description = mrkdwn(item.description).text.replace(/\*\*/g, '*');

        const url = 'https://gateway.ob1.io/ob/profile/' + guid + '?usecache=true';
        require("request")({url: url, json: true}, function(error, response, vendor) {
          if (error || response.statusCode !== 200) {
            return resolve({
              icon_emoji: ':ob1:',
              text: '*Price*: ' + price + '\n*Has moderators*: ' + ((listing.moderators.length >= 1) ? 'Yes' : 'No'),
              attachments: [{
                'author_name': listing.vendorID.peerID,
                'author_link': 'https://openbazaar.com/store/' + guid,
                'mrkdwn_in': ['footer', 'text'],
                'title': item.title,
                'title_link': 'https://openbazaar.com/store/' + guid + '/' + itemHash,
                'text': item_description,
                'image_url': 'https://gateway.ob1.io/ob/images/' + item.images.small,
                'thumb_url': 'https://gateway.ob1.io/ob/images/' + item.images.small,
                'footer': ':ob1: This post will be removed in ' + settings.post_removal_time_readable + ' minutes.'
              }],
              channel: channel,
              username: bot.name
            });
          }

          const avatarHashes = typeof vendor.avatarHashes !== 'undefined'
            ? vendor.avatarHashes
            : vendor.headerHashes;

          return resolve({
            icon_emoji: ':ob1:',
            text: '*Price*: ' + price + '\n*Has moderators*: ' + ((listing.moderators.length >= 1) ? 'Yes' : 'No'),
            attachments: [{
              'author_name': vendor.name,
              'author_link': 'https://openbazaar.com/store/' + guid,
              'author_icon': 'https://gateway.ob1.io/ob/images/' + avatarHashes.small,
              'mrkdwn_in': ['footer', 'text'],
              'title': item.title,
              'title_link': 'https://openbazaar.com/store/' + guid + '/' + itemHash,
              'text': item_description,
              'image_url': 'https://gateway.ob1.io/ob/images/' + item.images[0].small,
              'thumb_url': 'https://gateway.ob1.io/ob/images/' + item.images[0].small,
              'footer': ':ob1: This post will be removed in ' + settings.post_removal_time_readable + ' minutes.'
            }],
            channel: channel,
            username: bot.name
          });
        });
      }).catch(function(err) {
        return resolve(handle_error(channel, err));
      });
    })
  }

  return {parseOBLinks: parseOBLinks};
};
