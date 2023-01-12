const {Client} = require('@elastic/elasticsearch');

const client = new Client({
    node : process.env.ELASTICSEARCH_URL,
    //maxRetries: 5,
    requestTimeout: 5000,
    //sniffOnStart: true,
});

module.exports = client;  
