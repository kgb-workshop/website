const GraphQLExecutor = require('../graphqlexecutor');

module.exports = async () => {
  const executor = new GraphQLExecutor();

  const result = await executor.query('./_data/workshop-data.ttl', {
    "name": { "@id": "http://schema.org/name", "@singular": true },
    "image": { "@id": "http://schema.org/image", "@singular": true },
    "description": { "@id": "http://schema.org/description", "@singular": true },
    "email": { "@id": "http://schema.org/email", "@singular": true },
    "website": { "@id": "http://schema.org/sameAs", "@singular": true },
    "twitter": { "@id": "http://open.vocab.org/terms/twitter-id", "@singular": true },
    "affiliation": { "@id": "http://schema.org/memberOf", "@singular": true },
    "linkedin": { "@id": "http://example.org/linkedin", "@singular": true },
    "role": { "@id": "http://schema.org/jobTitle", "@singular": true },
    "Person": "http://schema.org/Person",
  }, '{ ... on Person {name image description email website twitter affiliation linkedin role} }', result => {
    result.sort( (a, b) => {
      if (a.name > b.name) {
        return 1;
      } else {
        return -1;
      }
    });

    return result;
  });

  return result;
};
