const newEngine = require('@comunica/actor-init-sparql-rdfjs').newEngine;
const N3 = require('n3');
const Q = require('q');
const fs = require('fs');

module.exports = async () => {
 const result = await getOrganizers('./_data/workshop-data.ttl');

 return result;
};

async function getOrganizers(path) {
  const deferred = Q.defer();
  const rdfjsSource = await getRDFjsSourceFromFile(path);
  const engine = newEngine();
  const organizers = [];

  engine.query(`SELECT * {
     <https://kgb-workshop.org/resources/Event/kgb2019> <http://schema.org/organizer> ?s.
     
     ?s a <http://schema.org/Person>;
        <http://schema.org/name> ?name;
        <http://schema.org/image> ?image;
        <http://schema.org/description> ?description;
        <http://schema.org/email> ?email;
        <http://schema.org/sameAs> ?website;
        <http://open.vocab.org/terms/twitter-id> ?twitter;
        <http://schema.org/memberOf> ?affiliation;
        <http://example.org/linkedin> ?linkedin.
        
     OPTIONAL {
       ?s <http://schema.org/jobTitle> ?role.
     }
  }`,
    {sources: [{type: 'rdfjsSource', value: rdfjsSource}]})
    .then(function (result) {
      result.bindingsStream.on('data', async function (data) {
        data = data.toObject();

        let role = data['?role'];

        if (role && role.value !== '') {
          role = role.value;
        } else {
          role = null;
        }

        organizers.push({
          name: data['?name'].value,
          image: data['?image'].value,
          description: data['?description'].value,
          email: data['?email'].value,
          twitter: data['?twitter'].value,
          website: data['?website'].value,
          affiliation: data['?affiliation'].value,
          linkedin: data['?linkedin'].value,
          role
        });
      });

      result.bindingsStream.on('end', function () {
        organizers.sort( (a, b) => {
          if (a.name > b.name) {
            return 1;
          } else {
            return -1;
          }
        });

        deferred.resolve(organizers);
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
