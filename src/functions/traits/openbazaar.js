/**
 * This module contains all the Openbazaar related calls
 *
 * @module traits
 */

module.exports = function(slack, bot, settings, listingsDB) {
  const md = require('html-md-2'),
    Promise = require('promise'),
    request = require('request-promise');

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
      return listingsDB.insertListing(message).then(function() {
        console.log('Listing message posted and inserted')
      });
    }).catch(function(error) {
      console.log('Error: ');
      console.log(error)
    })
  }

  function processOBLink(guid, itemHash, channel) {
    console.log(guid, itemHash, channel);
    return new Promise(function(resolve, reject) {
      if (guid != null && itemHash == null) {
        processUserLink(guid, channel).then(function(data) {
          resolve(data)
        }).catch(function(error) {
          reject(error)
        })
      } else if (guid != null && itemHash != null) {
        processItemLink(guid, itemHash, channel).then(function(data) {
          resolve(data)
        }).catch(function(error) {
          reject(error)
        })
      } else {
        reject()
      }
    })
  }

  function processUserLink(guid, channel) {
    return new Promise(function(resolve) {
      const url = 'https://gateway.ob1.io/ob/profile/' + guid + '?usecache=true';

      request.get({url: url, json: true, timeout: 2000}).then(function(profile) {
        if (false === profile.success) {
          return outputUserProfileError(profile);
        }

        const description = md(profile.shortDescription).replace(/\*\*/g, '*')
          + '\n\n*Moderator*: ' + ((profile.moderator) ? 'Yes' : 'No');

        resolve({
          icon_emoji: ':ob1:',
          attachments: [{
            'mrkdwn_in': ['footer', 'text'],
            'title': 'User: ' + profile.name,
            'title_link': 'https://openbazaar.com/store/home/' + guid,
            'text': description,
            'image_url': 'https://gateway.ob1.io/ob/images/' + profile.avatarHashes.small,
            'thumb_url': 'https://gateway.ob1.io/ob/images/' + profile.avatarHashes.small,
            'footer': 'This post will be removed in ' + settings.post_removal_time_readable + ' minutes.',
            'footer_icon': "https://avatars.slack-edge.com/2016-04-18/35680932023_f9e79dc3f27210589e89_48.png"
          }],
          channel: channel,
          username: bot.name
        })
      }).catch(function(err) {
        outputUserProfileError(err);
      });

      function outputUserProfileError(err) {
        if(err.message === 'Error: ESOCKETTIMEDOUT') {
          return resolve({
            icon_emoji: ':ob1:',
            text: 'This user could not be loaded!',
            channel: channel,
            username: bot.name,
          })
        }

        resolve({
          icon_emoji: ':ob1:',
          text: 'Oh oh! Something went wrong.',
          channel: channel,
          username: bot.name,
          attachments: [{
            'mrkdwn_in': ['footer', 'text'],
            'text': ((err === 'Invalid query') ? 'This user could not be found!' : err),
            'footer': ':ob1: This post will be removed in ' + settings.post_removal_time_readable + ' minutes.'
          }]
        })
      }
    })
  }

  function processItemLink(guid, itemHash, channel) {
    return new Promise(function(resolve, reject) {
      const url = 'https://gateway.ob1.io/ob/listing/' + guid + '/' + itemHash + '?usecache=true';
      request.get({url: url, json: true, timeout: 2000}).then(function(body) {
        if (false === body.success) {
          return outputItemError(body);
        }

        const listing = body.listing;
        const metadata = listing.metadata;
        const item = listing.item;

        const price_fiat = item.price;
        const price = parseFloat(price_fiat / 100).toFixed(2) + metadata.pricingCurrency;
        const item_description = md(item.description).replace(/\*\*/g, '*').replace(/\\_/g, '_');

        const url = 'https://gateway.ob1.io/ob/profile/' + guid + '?usecache=true';
        require("request")({url: url, json: true}, function(error, response, vendor) {
          if (error || response.statusCode !== 200) {
            return resolve({
              icon_emoji: ':ob1:',
              text: '*Price*: ' + price,
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

          return resolve({
            icon_emoji: ':ob1:',
            text: '*Price*: ' + price,
            attachments: [{
              'author_name': vendor.name,
              'author_link': 'https://openbazaar.com/store/' + guid,
              'author_icon': 'https://gateway.ob1.io/ob/images/' + vendor.avatarHashes.small,
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
        outputItemError(err);
      });

      function outputItemError(err) {
        if(err.message === 'Error: ESOCKETTIMEDOUT') {
          return resolve({
            icon_emoji: ':ob1:',
            text: 'This listing could not be loaded!',
            channel: channel,
            username: bot.name,
          })
        }

        resolve({
          icon_emoji: ':ob1:',
          text: 'Oh oh!',
          channel: channel,
          username: bot.name,
          attachments: [{
            'mrkdwn_in': ['footer', 'text'],
            'text': 'Something broke',
            'footer': ':ob1: This post will be removed in ' + settings.post_removal_time_readable + ' minutes.'
          }]
        })
      }
    })
  }

  return {parseOBLinks: parseOBLinks};
};
