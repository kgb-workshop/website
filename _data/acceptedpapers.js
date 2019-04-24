/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

const {query} = require('graphqlld-on-file');

module.exports = async () => {
  const result = await query('./_data/workshop-data.ttl', {
    "name": { "@id": "http://schema.org/name", "@singular": true },
    "review": { "@id": "http://schema.org/review", "@singular": true },
    "paperType": { "@id": "https://kgb-workshop.org/paperType", "@singular": true },
    "order": { "@id": "https://kgb-workshop.org/authorOrder", "@singular": true },
    "author": { "@reverse": "http://schema.org/author" },
    "Author": { "@id": "http://schema.org/Author", },
    "Article": "http://schema.org/Article",
  }, '{ ... on Article {name review paperType author {name order} } }');

  result.sort( (a, b) => {
    if (a.name > b.name) {
      return 1;
    } else {
      return -1;
    }
  });

  const papers = {};

  result.forEach(r => {
    if (!papers[r.name]) {
      papers[r.name] = r;
      papers[r.name].authors = [];
    }

    papers[r.name].authors.push({name: r.author[0].name[0], order: r.author[1].order[0]});
  });

  for (const p in papers) {
    papers[p].authors.sort((a, b) => {
      if (a.order > b.order) {
        return 1;
      } else {
        return -1;
      }
    });

    papers[p].authors = papers[p].authors.map(a => a.name);
  }

  console.log(Object.values(papers));

  return Object.values(papers);
};
