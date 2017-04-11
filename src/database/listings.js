/**
 * This module contains the listing database class
 * @module listingdatabase
 *
 */

/**
 * This class contains the listing database.
 *
 * @class ListingDatabase
 *
 * @param {Settings} settings The settings class is required to get certain values
 */
module.exports = function (settings) {
    var fsAdapter = require('./FsAdapter.js')(),
        Promise = require('promise'),
        deasync = require('deasync'),
        touch = require('touch'),
        loki = require('lokijs'),
        ListingDatabase = {},
        database = null,
        listings = null;

    // Ensure the listing database exists and load a possibly existing DB.
    touch(settings.database_location, {}, function () {
        database = new loki(settings.database_location, {
            autosave: true,
            autosaveInterval: 1000,
            adapter: new fsAdapter()
        });
    });

    // Force the calling process to wait until our DB is loaded.
    deasync.loopWhile(function () {
        return database == null;
    });

    database.loadDatabase({}, function () {
        listings = database.getCollection('listings');
        if (listings == null) listings = database.addCollection('listings', {unique: ['id']});
    });

    // Force the calling process to wait until our DB is loaded.
    deasync.loopWhile(function () {
        return listings == null;
    });

    ListingDatabase.getListings = function () {
        return new Promise(function (resolve) {
            resolve(listings.find());
        });
    };

    ListingDatabase.getOldListings = function (time) {
        return new Promise(function (resolve) {
            resolve(listings.find({createdAt: {$lt: new Date((new Date()) - time)}}));
        })
    };

    ListingDatabase.insertListing = function (listing) {
        return new Promise(function (resolve, reject) {
            listing.$loki = undefined;
            listing.createdAt = Date.now();

            listings.insert(listing);
            database.saveDatabase(function (err) {
                if (err == null) resolve(listing);
                else reject(err);
            });
        });
    };

    ListingDatabase.removeListing = function (listing) {
        return new Promise(function (resolve, reject) {
            listings.removeWhere(function (obj) {
                return obj == listing;
            });
            database.saveDatabase(function (err) {
                if (err == null) resolve();
                else reject(err);
            });
        });
    };

    ListingDatabase.listings = listings;

    return ListingDatabase;
};