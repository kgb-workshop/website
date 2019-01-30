const GraphQLExecutor = require('../graphqlexecutor');

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

module.exports = async () => {
  const executor = new GraphQLExecutor();
  const result = await executor.query('./_data/workshop-data.ttl', {
    "title": { "@id": "http://schema.org/name", "@singular": true },
    "description": { "@id": "http://schema.org/description", "@singular": true },
    "date": { "@id": "http://schema.org/startDate", "@singular": true },
    "subEvent": { "@reverse": "http://schema.org/subEvent", "@singular": true },
    "Event": "http://schema.org/Event",
    "workshop": "https://kgb-workshop.org/resources/Event/kgb2019"
  },`{... on Event {title description date subEvent(_:workshop)}}`, importantDates => {
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

    return importantDates;
  });

  return result;
};
