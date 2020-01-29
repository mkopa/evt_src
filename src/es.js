function initStore(config = {
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    dbName: 'card_eventstore',
    eventsCollectionName: 'events',
    snapshotsCollectionName: 'snapshots',
    transactionsCollectionName: 'transactions',
    timeout: 10000,
    options: {
        useNewUrlParser: true
    }
}) {
    const es = require('eventstore')(config);
    es.close = function() {
      if(es.store.db) {
          es.store.db.close();
      }
    };
    es.defineEventMappings({
        id: 'event_id'
    });
    es.useEventPublisher(function(evt, callback) {
        console.log('emitting event', evt);
        callback(); // should be called when message queue ACK'ed message received
    });
    return new Promise(function(resolve, reject) {
        es.init(function (err) {
            if(err) reject(err);
            resolve(es);
        });
    });
}

module.exports = initStore;