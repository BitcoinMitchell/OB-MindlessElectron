/**
 * This module contains a custom FsAdapter class
 * @module fsadapter
 *
 */

/**
 * This class contains a custom FsAdapter, which currently does the same as the original adapter.
 * Could be used in the future for logging or security purposes
 *
 * @class FsAdapter
 *
 */
module.exports = function () {
    var fs = require('fs');

    function FsAdapter() {
        this.loadDatabase = function loadDatabase(dbname, callback) {
            fs.readFile(dbname, {
                encoding: 'utf8'
            }, function readFileCallback(err, data) {
                if (err) {
                    callback(new Error(err));
                } else {
                    callback(data);
                }
            });
        };

        this.saveDatabase = function saveDatabase(dbname, dbstring, callback) {
            fs.writeFile(dbname, dbstring, callback);
        };

        this.deleteDatabase = function deleteDatabase(dbname, callback) {
            fs.unlink(dbname, function deleteDatabaseCallback(err) {
                if (err) {
                    callback(new Error(err));
                } else {
                    callback();
                }
            });
        };
    }

    return FsAdapter;
};