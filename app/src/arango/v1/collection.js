const names = {
  metadata: 'metadata',
  quotes: 'quotes',
  replies: 'replies',
  retweets: 'retweets',
  tweets: 'tweets',
  users: 'users'
};

const collections = [
  names.metadata,
  names.tweets,
  names.users
];

const edgeCollections = [
  names.quotes,
  names.replies,
  names.retweets
]

module.exports = {
  collections,
  edgeCollections,
  names
};
