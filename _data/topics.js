const newEngine = require('@comunica/actor-init-sparql-rdfjs').newEngine;
const N3 = require('n3');
const Q = require('q');
const fs = require('fs');

module.exports = async () => {
 const result = await getTopics('./_data/workshop-data.ttl');

 return result;
};

async function getTopics(path) {
  const deferred = Q.defer();
  const rdfjsSource = await getRDFjsSourceFromFile(path);
  const engine = newEngine();
  const topics = {};

  engine.query(`SELECT * {     
     ?s a <http://schema.org/CreativeWork>;
        <http://schema.org/name> ?name;
        <http://schema.org/keyword> ?keyword.
  }`,
    {sources: [{type: 'rdfjsSource', value: rdfjsSource}]})
    .then(function (result) {
      result.bindingsStream.on('data', async function (data) {
        data = data.toObject();
        const name =  data['?name'].value;
        const keyword =  data['?keyword'].value;

        if (!topics[name]) {
          topics[name] = [];
        }

        topics[name].push(keyword);
      });

      result.bindingsStream.on('end', function () {
        const result = [];
        const mainTopics = Object.keys(topics);

        for (let m of mainTopics) {
          result.push({name: m, subTopics: topics[m]});
        }

        deferred.resolve(result);
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
