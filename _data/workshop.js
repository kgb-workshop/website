const {query} = require('graphqlld-on-file');

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

module.exports = async () => {
  let result = await query('./_data/workshop-data.ttl', {
    "title": { "@id": "http://schema.org/name", "@singular": true },
    "location": { "@id": "http://schema.org/location", "@singular": true},
    "mainEvent": { "@id": "http://schema.org/superEvent", "@singular": true},
    "date": { "@id": "http://schema.org/startDate", "@singular": true},
    "Event": "http://schema.org/Event"
  },`{... on Event {title, location, mainEvent, date}}`);

  result = result[0];
  const date = new Date(result.date);
  result.date = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;

  return result;
};
