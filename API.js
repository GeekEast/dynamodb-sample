const axios = require('axios');
// const request = axios.create({ baseURL: 'http://localhost:3500/' });
const request = axios.create({
	baseURL: 'http://statsapi.ap-southeast-2.elasticbeanstalk.com/',
	headers: {
		'x-auth-token': ''
	}
});

module.exports = request;
