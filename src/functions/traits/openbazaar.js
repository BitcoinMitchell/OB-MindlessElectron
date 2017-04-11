/**
 * This module contains all the Openbazaar related calls
 *
 * @module traits
 */

module.exports = function (slack, bot, settings, listingsDB) {
    var openbazaar = {},
        md = require('html-md'),
        Promise = require('promise'),
        request = require('request-promise');

    openbazaar.parseOBLinks = parseOBLinks;

    function parseOBLinks(data) {
        var routeArray = data.text.replace('>', '').replace('<', '').split('ob://')[1].replace(/ /g, '').split('/');
        var channel = data.channel;

        var guidOrHandle = (routeArray[0].charAt(0) === '@' || routeArray[0].length === 40) ? routeArray[0].split(/[^A-Za-z0-9@]/)[0] : null;
        var itemHash = routeArray[2] ? routeArray[2].substring(0, 40) : null;

        if (guidOrHandle !== null && guidOrHandle.length >= 1 && guidOrHandle !== '') {
            slack.preProcessGH(guidOrHandle).then(function (guid) {
                return processOBLink(guid, itemHash, channel)
            }).then(function (botResponse) {
                return bot._api('chat.postMessage', botResponse)
            }).then(function (message) {
                return listingsDB.insertListing(message).then(function () {
                    console.log('Listing message posted and inserted')
                });
            }).catch(function (error) {
                console.log('Error: ');
                console.log(error)
            })
        }
    }

    function processOBLink(guid, itemHash, channel) {
        return new Promise(function (resolve, reject) {
            if (guid != null && itemHash == null) {
                processUserLink(guid, channel).then(function (data) {
                    resolve(data)
                }).catch(function (error) {
                    reject(error)
                })
            } else if (guid != null && itemHash != null) {
                processItemLink(guid, itemHash, channel).then(function (data) {
                    resolve(data)
                }).catch(function (error) {
                    reject(error)
                })
            } else {
                reject()
            }
        })
    }

    function processUserLink(guid, channel) {
        return new Promise(function (resolve) {
            var url = 'https://api.duosear.ch/getById';

            request.post({url: url, body: {id: guid}, json: true, timeout: 2000}).then(function (profile) {
                if (profile === 'Invalid query') {
                    outputUserProfileError(profile);
                }

                var description = md(profile.short_description).replace(/\*\*/g, '*')
                    + '\n\n*Moderator*: ' + ((profile.moderator) ? 'Yes' : 'No')
                    + '\n\n*Trusted*: ' + ((profile.trusted) ? 'Yes' : 'No');
                var name = profile.name;

                if (profile.trusted) {
                    name = name + '✓';
                }

                resolve({
                    icon_emoji: ':ob1:',
                    attachments: [{
                        'mrkdwn_in': ['footer', 'text'],
                        'title': 'User: ' + name,
                        'title_link': 'https://duosear.ch/' + guid,
                        'text': description,
                        'image_url': 'https://duosear.ch/images/' + profile.avatar_hash + '.jpg',
                        'thumb_url': 'https://duosear.ch/images_thumb/' + profile.avatar_hash + '.jpg',
                        'footer': 'This post will be removed in ' + settings.post_removal_time_readable + ' minutes.',
                        'footer_icon': "https://avatars.slack-edge.com/2016-04-18/35680932023_f9e79dc3f27210589e89_48.png"
                    }],
                    channel: channel,
                    username: bot.name
                })
            }).catch(function (err) {
                outputUserProfileError(err);
            });

            function outputUserProfileError(err) {
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
        return new Promise(function (resolve) {
            var url = 'https://api.duosear.ch/getById';

            request.post({url: url, body: {id: itemHash}, json: true, timeout: 2000}).then(function (body) {
                if (body === 'Invalid query') {
                    outputItemError(body);
                }

                var item = body.vendor_offer.listing.item;
                var vendor = body.vendor_offer.listing.vendor;
                var vendor_id = body.vendor_offer.listing.id;
                var price_fiat = item.price_per_unit.fiat;
                var price_bitcoin = item.price_per_unit.bitcoin;

                var price = (price_fiat != null) ? parseFloat(price_fiat.price).toFixed(2) + price_fiat.currency_code : price_bitcoin + 'BTC';
                var author_name = (vendor.name != null) ? vendor.name : (vendor.handle != null) ? vendor.handle : vendor_id.guid;
                var item_description = md(item.description).replace(/\*\*/g, '*').replace(/\\_/g, '_');

                if (vendor.trusted) {
                    author_name = author_name + '✓';
                }

                return resolve({
                    icon_emoji: ':ob1:',
                    text: '*Price*: ' + price,
                    attachments: [{
                        'author_name': author_name,
                        'author_link': 'https://duosear.ch/' + guid,
                        'author_icon': 'https://duosear.ch/images/' + vendor.avatar_hash + '.jpg',
                        'mrkdwn_in': ['footer', 'text'],
                        'title': item.title,
                        'title_link': 'https://duosear.ch/' + guid + '/listing/' + itemHash,
                        'text': item_description,
                        'image_url': 'https://duosear.ch/images/' + item.image_hashes[0] + '.jpg',
                        'thumb_url': 'https://duosear.ch/images_thumb/' + item.image_hashes[0] + '.jpg',
                        'footer': ':ob1: This post will be removed in ' + settings.post_removal_time_readable + ' minutes.'
                    }],
                    channel: channel,
                    username: bot.name
                });
            }).catch(function (err) {
                outputItemError(err);
            });

            function outputItemError(err) {
                resolve({
                    icon_emoji: ':ob1:',
                    text: 'Oh oh! Something went wrong.',
                    channel: channel,
                    username: bot.name,
                    attachments: [{
                        'mrkdwn_in': ['footer', 'text'],
                        'text': ((err === 'Invalid query') ? 'This listing could not be found!' : err),
                        'footer': ':ob1: This post will be removed in ' + settings.post_removal_time_readable + ' minutes.'
                    }]
                })
            }
        })
    }

    return openbazaar;
};