'use strict';

require('./timestamp');
const winston = require('winston');

winston.format.formatLevel = function(info) {
  return `[${info.level}]`;
};

global.winston = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.colorize(),
    winston.format.printf(function(info) {
      return `${winston.format.formatLevel(info)} ${timestamp.current()} ${info.message}`;
    })
  ),
  transports: [new winston.transports.Console(), new winston.transports.File({filename: 'openbazaar.log'})],
});
