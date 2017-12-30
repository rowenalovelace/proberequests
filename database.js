/*
 * vim: ts=4:sw=4:expandtab
 */

(function () {
    'use strict';
    let database = {id: 'proberequests'};
    database.migrations = [
        {
            version: '1.0',
            migrate: function(transaction, next) {
                console.log('migration 1.0');
                console.log('creating object stores');
                var ssids = transaction.db.createObjectStore('ssids');
                ssids.createIndex('lastSeen', 'lastSeen', { unique: false });
            }
        }
    ];

    let ssid = Backbone.Model.extend({
      database: database,
      storeName: 'ssids',
      idAttribute: 'name'
    });
    let SSIDCollection = Backbone.Collection.extend({
      database: database,
      storeName: 'ssids',
      model: ssid
    });
    window.store = {};
    window.store.ssids = new SSIDCollection();
}());
