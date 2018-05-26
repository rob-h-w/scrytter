module.exports = function (db) {
  return async (collectionName) => {
    const collections = await db.collections();
    const collectionNames = collections.map(collection => collection.name);

    const collection = db.collection(collectionName);

    if (collectionNames.indexOf(collectionName) === -1) {
      await collection.create();
    }

    return collection;
  };
};
