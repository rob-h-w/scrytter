const _ = require('lodash');

const { dbName } = require('../dbName');
const db = require('../getDatabase')({ database: dbName });
const { names } = require('./collection');

module.exports = async function verify() {
  db.useDatabase(dbName);
  await db.get();
  const metadata = db.collection(names.metadata);
  const version = await metadata.document('version');
  if (version.value !== 1) {
    throw new Error(`Expected version 1, got ${version.value}.`);
  }

  const collections = (await db.collections()).map((collection) => collection.name);
  const expectedCollections = [
    names.metadata,
    names.quotes,
    names.replies,
    names.retweets,
    names.tweets,
    names.users
  ];

  if(_.intersection(expectedCollections, collections).length !== expectedCollections.length) {
    throw new Error(
      `Not all of ${
        JSON.stringify(expectedCollections, null, 2)
      } are found in ${
        JSON.stringify(collections, null, 2)
      }.`
    );
  }
};
