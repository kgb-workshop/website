const GraphQLExecutor = require('../graphqlexecutor');

module.exports = async () => {
 const executor = new GraphQLExecutor();
 const result = await executor.query('./_data/workshop-data.ttl',{
   "name": { "@id": "http://schema.org/name", "@singular": true },
   "keyword": { "@id": "http://schema.org/keyword", "@singular": true},
   "CreativeWork": "http://schema.org/CreativeWork"
 },`{... on CreativeWork {name keyword}}`, result => {
   const topics = {};

   result.forEach(r => {
     const {name, keyword} = r;

     if (!topics[name]) {
       topics[name] = [];
     }

     topics[name].push(keyword);
   });

   result = [];
   const mainTopics = Object.keys(topics);

   for (let m of mainTopics) {
     result.push({name: m, subTopics: topics[m]});
   }

   return result;
 });

 //console.log(result);

 return result;
};
