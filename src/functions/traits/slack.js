/**
 * This module contains all the Slack related calls
 *
 * @module traits
 */

module.exports = function(bot) {
  const slack = {};

  slack.preProcessGH = preProcessGH;

  function preProcessGH(guidOrHandle) {
    return new Promise(function(resolve, reject) {
      if (guidOrHandle.indexOf('@U') >= 0) {
        bot._api('users.info', {user: guidOrHandle.replace('@', '')}).then(function(data) {
          resolve('@' + data.user.name)
        }).catch(function(error) {
          reject(error)
        })
      } else {
        resolve(guidOrHandle)
      }
    })
  }

  return slack;
};
