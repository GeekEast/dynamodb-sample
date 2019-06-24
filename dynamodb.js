const AWS = require('aws-sdk');
// configure AWS
AWS.config.update({
	accessKeyId: '',
	secretAccessKey: '',
	region: ''
});

// initialize the dynamodb client
const client = new AWS.DynamoDB.DocumentClient();
module.exports = client;
