/**
 * This module contains the Settings class
 * @module settings
 *
 */

/**
 * This class uses the previously generated {@link Arguments} class and turns them into a valid settings file
 *
 * @class Settings
 *
 * @param {Arguments} args The Argument object created earlier
 *
 * @returns {Object} An object containing all settings
 */
module.exports = function(args) {
  const path = require('path');

  this.slack = {};
  this.slack.groups = [];

  //-=-=-=-=-=- Slack configuration -=-=-=-=-=-//
  const _this = this;

  args.groups.forEach(function(group) {
    var bot_name = (typeof group.group_bot_name === 'undefined') ? args.bot_name : group.group_bot_name;

    _this.slack.groups.push({
      "name": group.group_name,
      "bot_name": bot_name,
      "token": group.group_token
    });
  });
  //-=-=-=-=-=--=-=-=-=-=--=-=-=-=-=--=-=-=-=-=--=-=-=-=-=-//

  //-=-=-=-=-=- Containers and saved variables -=-=-=-=-=-//
  /**
   * Do we log and output everything?
   * @type {boolean}
   */
  this.verbose = args.verbose;

  /**
   * How long will posts be shown?
   * @type {number}
   */
  this.post_removal_time_readable = 30;

  /**
   * Machine version of post_removal_time_readable
   * @type {number}
   */
  this.post_removal_time = 60000 * this.post_removal_time_readable;

  /**
   * Where is our database located
   * @type {string}
   */
  this.database_location = path.normalize(__dirname + '/../var/database.db');
  //-=-=-=-=-=--=-=-=-=-=--=-=-=-=-=--=-=-=-=-=--=-=-=-=-=-//

  return this;
};
