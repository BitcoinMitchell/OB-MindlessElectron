/**
 * This module contains the functions class
 *
 * @module functions
 */

/**
 * This class contains all the possible functions of this SlackBot.
 * However, this class works like how traits work in PHP.
 *
 * @class Functions
 *
 * @param {Settings} settings The settings of the bot
 * @param {SlackBot} bot The created bot class
 * @param {ListingDatabase} database The listings database
 */
module.exports = function(settings, bot, database) {
  let functions = {};

  const slack = require('./traits/slack.js')(bot),
    openbazaar = require('./traits/openbazaar.js')(slack, bot, settings, database);

  functions = Object.assign(openbazaar, functions);
  functions = Object.assign(slack, functions);

  return functions;
};
