const {query} = require('graphqlld-on-file');

module.exports = async () => {
  const result = await query('./_data/workshop-data.ttl', {
    "name": { "@id": "http://schema.org/name", "@singular": true },
    "affiliation": { "@id": "http://schema.org/memberOf", "@singular": true },
    "event": { "@id": "http://schema.org/performerIn", "@singular": true },
    "Person": "http://schema.org/Person",
    "workshop": "https://kgb-workshop.org/resources/Event/kgb2019"
  }, `{ ... on Person {name affiliation event(_:workshop)} }`);

  result.sort( (a, b) => {
    if (a.name > b.name) {
      return 1;
    } else {
      return -1;
    }
  });

  return result;
};
