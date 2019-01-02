const newEngine = require('@comunica/actor-init-sparql-rdfjs').newEngine;
const N3 = require('n3');
const Q = require('q');
const fs = require('fs');

module.exports = async () => {
 const result = await getProgramCommittee('./_data/workshop-data.ttl');

 return result;
};

async function getProgramCommittee(path) {
  const deferred = Q.defer();
  const rdfjsSource = await getRDFjsSourceFromFile(path);
  const engine = newEngine();
  const programCommittee = [];

  engine.query(`SELECT * {
     ?s a <http://schema.org/Person>;
        <http://schema.org/performerIn> <http://kgb.rml.io/resources/Event/kgb2019>;
        <http://schema.org/name> ?name;
        <http://schema.org/memberOf> ?affiliation.
  }`,
    {sources: [{type: 'rdfjsSource', value: rdfjsSource}]})
    .then(function (result) {
      result.bindingsStream.on('data', async function (data) {
        data = data.toObject();

        programCommittee.push({
          name: data['?name'].value,
          affiliation: data['?affiliation'].value,
        });
      });

      result.bindingsStream.on('end', function () {
        programCommittee.sort( (a, b) => {
          if (a.name > b.name) {
            return 1;
          } else {
            return -1;
          }
        });

        deferred.resolve(programCommittee);
      });
    });

  return deferred.promise;
}

/**
 * This method returns an RDFJSSource of an file
 * @param {string} path: path of the file
 * @returns {Promise}: a promise that resolve with the corresponding RDFJSSource
 */
function getRDFjsSourceFromFile(path) {
  const deferred = Q.defer();

  fs.readFile(path, 'utf-8', (err, data) => {
    if (err) throw err;

    const parser = N3.Parser();
    const store = N3.Store();

    parser.parse(data, (err, quad, prefixes) => {
      if (err) {
        deferred.reject();
      } else if (quad) {
        store.addQuad(quad);
      } else {
        const source = {
          match: function (s, p, o, g) {
            return require('streamify-array')(store.getQuads(s, p, o, g));
          }
        };

        deferred.resolve(source);
      }
    });
  });

  return deferred.promise;
}
