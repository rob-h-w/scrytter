const rawArango = require('arangojs');
const sinon = require('sinon');

const collectionsList = [
  'metadata',
  'quotes',
  'replies',
  'retweets',
  'tweets',
  'users'
];

module.exports = function mockArango() {
  const rawDb = new rawArango.Database({
    url: 'http://db:8529'
  });
  const databaseInstance = sinon.stub(rawDb);
  const arangojs = {};
  Object.keys(rawArango).forEach(member => {
    arangojs[member] = sinon.stub(rawArango, member);
  });
  const collection = sinon.stub().returns({
    create: sinon.stub().resolves(),
    drop: sinon.stub().resolves(),
    save: sinon.stub().resolves()
  });
  const metadata = {
    create: sinon.stub().resolves(),
    document: sinon.stub().resolves({ value: 1 }),
    drop: sinon.stub().resolves(),
    save: sinon.stub().resolves()
  };
  collection.withArgs('metadata').returns(metadata);
  databaseInstance.collection = collection;
  databaseInstance.collections.resolves(collectionsList.map(collection => { return { name: collection }; }));
  databaseInstance.edgeCollection = sinon.stub().returns({
    create: sinon.stub().resolves(),
    drop: sinon.stub().resolves()
  });
  databaseInstance.get.resolves();
  databaseInstance.listDatabases.resolves([ 'scrytter' ]);
  arangojs.Database.returns(databaseInstance);

  return {
    arangojs,
    databaseInstance,
    reset: () => {
      Object.keys(rawArango).forEach(member => {
        rawArango[member].restore();
      });
    }
  }
};
