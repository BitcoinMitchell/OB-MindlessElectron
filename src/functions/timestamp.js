'use strict';

global.timestamp = {
  getDay: function(date) {
    return ('0' + date.getDate()).slice(-2);
  },
  getMonth: function(date) {
    return ('0' + (date.getMonth() + 1)).slice(-2);
  },
  getHours: function(date) {
    return ('0' + date.getHours()).slice(-2);
  },
  getMinutes: function(date) {
    return ('0' + date.getMinutes()).slice(-2);
  },
  getSeconds: function(date) {
    return ('0' + date.getSeconds()).slice(-2);
  },
  getYear: function(date) {
    return date.getFullYear();
  },
  current: function() {
    const date = new Date();
    const day = this.getDay(date);
    const month = this.getMonth(date);
    const year = this.getYear(date);
    const hours = this.getHours(date);
    const minutes = this.getMinutes(date);
    const seconds = this.getSeconds(date);

    return '[' + day + '-' + month + '-' + year + ' ' + hours + ':' + minutes + ':' + seconds + ']';
  }
};
