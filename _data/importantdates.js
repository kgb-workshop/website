const newEngine = require('@comunica/actor-init-sparql-rdfjs').newEngine;
const N3 = require('n3');
const Q = require('q');
const fs = require('fs');

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

module.exports = async () => {
 const result = await getImportantDates('./_data/workshop-data.ttl');

 return result;
};

async function getImportantDates(path) {
  const deferred = Q.defer();
  const rdfjsSource = await getRDFjsSourceFromFile(path);
  const engine = newEngine();
  const importantDates = [];

  engine.query(`SELECT * {
     <https://kgb-workshop.org/resources/Event/kgb2019> <http://schema.org/subEvent> ?s.
     
     ?s a <http://schema.org/Event>;
        <http://schema.org/name> ?title;
        <http://schema.org/description> ?desc;
        <http://schema.org/startDate> ?date.
  }`,
    {sources: [{type: 'rdfjsSource', value: rdfjsSource}]})
    .then(function (result) {
      result.bindingsStream.on('data', async function (data) {
        data = data.toObject();

        importantDates.push({
          title: data['?title'].value,
          date: data['?date'].value,
          description: data['?desc'].value,
        });
      });

      result.bindingsStream.on('end', function () {
        importantDates.sort( (a, b) => {
          return new Date(a.date) - new Date(b.date);
        });

        importantDates.forEach(importantDate => {
          const date = new Date(importantDate.date);
          importantDate.date = {
            day: date.getDate(),
            monthYear: monthNames[date.getMonth()] + ', ' + date.getFullYear()
          };
        });

        deferred.resolve(importantDates);
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
